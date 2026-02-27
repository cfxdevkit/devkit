import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type Server as HttpServer, createServer as createHttpServer } from 'node:http';
import compression from 'compression';
import cors from 'cors';
import type { Express } from 'express';
import express, { type Request, type Response, type NextFunction } from 'express';
import { Server as IOServer } from 'socket.io';
import { createDevnodeRoutes } from './routes/devnode.js';
import { createAccountRoutes } from './routes/accounts.js';
import { createContractRoutes } from './routes/contracts.js';
import { createMiningRoutes } from './routes/mining.js';
import { createNetworkRoutes } from './routes/network.js';
import { createKeystoreRoutes } from './routes/keystore.js';
import { NodeManager } from './node-manager.js';
import { setupWebSocket } from './ws.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Locations where the pre-built Next.js static export may reside */
const UI_CANDIDATES = [
  join(__dirname, '..', 'ui', 'out'),              // published npm package
  join(__dirname, '..', '..', 'devkit-ui', 'out'), // local monorepo development
];

export interface AppConfig {
  port: number;
}

export interface AppInstance {
  app: Express;
  httpServer: HttpServer;
  io: IOServer;
  start(): Promise<void>;
}

export function createApp(config: AppConfig): AppInstance {
  const { port } = config;

  const app = express();
  const httpServer = createHttpServer(app);
  const io = new IOServer(httpServer, { cors: { origin: '*' } });

  const nodeManager = new NodeManager();

  // ── Middleware ───────────────────────────────────────────────────────────
  app.use(cors());
  app.use(compression() as express.RequestHandler);
  app.use(express.json({ limit: '10mb' }));

  // ── Health ───────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  // ── API routes ───────────────────────────────────────────────────────────
  app.use('/api/node', createDevnodeRoutes(nodeManager));
  app.use('/api/accounts', createAccountRoutes(nodeManager));
  app.use('/api/contracts', createContractRoutes(nodeManager));
  app.use('/api/mining', createMiningRoutes(nodeManager));
  app.use('/api/network', createNetworkRoutes(nodeManager));
  app.use('/api/keystore', createKeystoreRoutes());

  // ── Static UI ─────────────────────────────────────────────────────────
  const uiDir = UI_CANDIDATES.find(existsSync);
  if (uiDir) {
    app.use(express.static(uiDir));
    // SPA fallback — return index.html for any non-API route
    app.get('*', (_req, res) => {
      const index = join(uiDir, 'index.html');
      if (existsSync(index)) {
        res.sendFile(index);
      } else {
        res.status(404).send('index.html not found');
      }
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        message: 'conflux-devkit API is running',
        note: 'UI not built. Run: pnpm --filter conflux-devkit-ui build',
        endpoints: ['/api/node', '/api/accounts', '/api/contracts', '/api/mining', '/api/network', '/api/keystore'],
      });
    });
  }

  // ── Error handler ────────────────────────────────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[conflux-devkit]', err.message);
    res.status(500).json({ error: err.message });
  });

  // ── WebSocket ────────────────────────────────────────────────────────────
  setupWebSocket(io, nodeManager);

  return {
    app,
    httpServer,
    io,
    async start(): Promise<void> {
      await nodeManager.initialize();
      return new Promise<void>((resolve, reject) => {
        httpServer.listen(port, (err?: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}

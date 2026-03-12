/*
 * Copyright 2025 Conflux DevKit Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '0.0.0.0';
const API_KEY = process.env.CAS_API_KEY ?? '';

const app = Fastify({ logger: true });

await app.register(helmet);
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? false,
});

// ── Auth hook ──────────────────────────────────────────────────────────────
// All /api/* routes require a Bearer token matching CAS_API_KEY.
app.addHook('onRequest', async (request, reply) => {
  if (!request.url.startsWith('/api/')) return;
  if (!API_KEY) return; // auth disabled when key is not set (dev mode)

  const auth = request.headers.authorization;
  if (auth !== `Bearer ${API_KEY}`) {
    await reply.code(401).send({ error: 'Unauthorized' });
  }
});

// ── Health check (public) ──────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', service: 'cas-backend' }));

// ── API routes ─────────────────────────────────────────────────────────────
app.get('/api/status', async () => ({
  status: 'ok',
  version: '0.1.0',
  // TODO: add CAS-specific status fields here
}));

// ── Start ──────────────────────────────────────────────────────────────────
try {
  await app.listen({ port: PORT, host: HOST });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

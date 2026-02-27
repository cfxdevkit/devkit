'use client';

import { io, type Socket } from 'socket.io-client';

/**
 * Singleton Socket.IO client.
 *
 * In development, set NEXT_PUBLIC_WS_URL=http://localhost:7748 so the UI
 * (running via `next dev` on a different port) can reach the Socket.IO server.
 * In production the UI is served by Express so an empty string works (same origin).
 */

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? '';
    _socket = io(url || undefined, {
      path: '/socket.io',
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Number.POSITIVE_INFINITY,
    });
  }
  return _socket;
}

/** Node status shape emitted by the server every 2 s */
export interface NodeStatusEvent {
  server: 'running' | 'stopped' | 'starting' | 'stopping';
  epochNumber?: number;
  mining?: { isRunning: boolean; interval?: number; blocksMined?: number };
  accounts?: number;
  rpcUrls?: {
    core: string;
    evm: string;
    coreWs: string;
    evmWs: string;
    ws: string;
  };
}

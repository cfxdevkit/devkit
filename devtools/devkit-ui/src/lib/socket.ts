'use client';

import { io, type Socket } from 'socket.io-client';

/**
 * Singleton Socket.IO client — connects back to the same origin so the
 * devkit server receives events regardless of how the app is launched.
 */

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io({
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
  miningStatus?: string;
  rpcUrls?: { core: string; evm: string; ws: string };
}

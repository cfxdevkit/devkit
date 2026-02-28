'use client';

import { Activity, Box, FileCode2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSocket, type NodeStatusEvent } from '@/lib/socket';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Activity },
  { href: '/contracts', label: 'Contracts', icon: FileCode2 },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const [nodeStatus, setNodeStatus] =
    useState<NodeStatusEvent['server']>('stopped');

  useEffect(() => {
    const socket = getSocket();
    const handler = (evt: NodeStatusEvent) => setNodeStatus(evt.server);
    socket.on('node:status', handler);
    return () => {
      socket.off('node:status', handler);
    };
  }, []);

  const dotClass =
    nodeStatus === 'running'
      ? 'status-dot-green'
      : nodeStatus === 'starting' || nodeStatus === 'stopping'
        ? 'status-dot-yellow'
        : 'status-dot-red';

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[#2a3147] bg-[#161b27]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[#2a3147] px-4 py-4">
        <Box className="h-5 w-5 text-blue-400" />
        <span className="text-sm font-semibold text-white">conflux-devkit</span>
      </div>

      {/* Node status indicator */}
      <div className="flex items-center gap-2 border-b border-[#2a3147] px-4 py-2.5 text-xs text-slate-400">
        <span className={dotClass} />
        <span className="capitalize">{nodeStatus}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors relative ${active
                  ? 'bg-cfx-500/10 text-cfx-400 font-medium before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-cfx-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2a3147] px-4 py-3 text-[11px] text-slate-600">
        Conflux Dev Node
      </div>
    </aside>
  );
}

function normalizeBasePath(value?: string): string {
  if (!value || value === '/') return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function joinPath(base: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeBasePath(base)}${normalizedPath}`;
}

export function getRuntimeBasePath(): string {
  const explicitBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
  if (explicitBasePath) return explicitBasePath;

  if (typeof window === 'undefined') return '';

  const proxyMatch = window.location.pathname.match(/^\/proxy\/\d+/);
  return proxyMatch?.[0] ?? '';
}

export function getApiBaseUrl(): string {
  const explicitApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(
    /\/$/,
    ''
  );
  if (explicitApiUrl) return `${explicitApiUrl}/api`;

  return joinPath(getRuntimeBasePath(), '/api');
}

export function getSocketPath(): string {
  const explicitSocketPath = normalizeBasePath(process.env.NEXT_PUBLIC_WS_PATH);
  if (explicitSocketPath) return joinPath(explicitSocketPath, '/socket.io');

  return joinPath(getRuntimeBasePath(), '/socket.io');
}

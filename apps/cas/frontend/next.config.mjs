/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages (required for pnpm monorepo ESM packages).
  transpilePackages: [
    '@cfxdevkit/theme',
    '@cfxdevkit/react',
    '@cfxdevkit/defi-react',
    '@cfxdevkit/wallet-connect',
    '@cfxdevkit/executor',
  ],
  // Exclude browser-only packages from the Node.js/SSR bundle.
  // ConnectKit and WalletConnect access browser globals (indexedDB, window.location,
  // document) synchronously at module-evaluation time; bundling them into the
  // server chunk causes `unhandledRejection: ReferenceError: indexedDB is not defined`
  // on startup even when `dynamic({ ssr: false })` is used. Marking them as
  // server-external prevents Turbopack from including them in the SSR bundle.
  serverExternalPackages: [
    'connectkit',
    '@walletconnect/sign-client',
    '@walletconnect/core',
    '@walletconnect/utils',
  ],
  // Force Turbopack to resolve wagmi and react to a single canonical instance.
  //
  // In a pnpm monorepo, packages with different peer-dep resolution keys get
  // their own copy of shared deps even when the semver version is identical.
  // Two wagmi copies = two separate WagmiContext objects → WagmiProviderNotFoundError.
  //
  // The ./node_modules/* paths (relative to this config file) point at the
  // frontend's canonical symlinks → same pnpm store entry for every import.
  turbopack: {
    resolveAlias: {
      wagmi: './node_modules/wagmi',
      react: './node_modules/react',
      'react-dom': './node_modules/react-dom',
      '@tanstack/react-query': './node_modules/@tanstack/react-query',
    },
  },
  // API URL for server components and client fetch.
  // Set NEXT_PUBLIC_API_URL in the Vercel project env vars:
  //   Production:  https://api.cas.cfxdevkit.org
  //   Development: http://localhost:3001
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages (required for pnpm monorepo ESM packages).
  transpilePackages: [
    '@cfxdevkit/theme',
    '@cfxdevkit/react',
    '@cfxdevkit/wallet-connect',
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
  // Force Turbopack to resolve wagmi, connectkit, and react to single canonical
  // instances. In a pnpm monorepo, packages with differing peer-dep resolution
  // keys can each carry their own copy of shared deps, causing context mismatches
  // (WagmiProviderNotFoundError, "ConnectKit Hook must be inside a Provider", etc.)
  turbopack: {
    resolveAlias: {
      wagmi: './node_modules/wagmi',
      connectkit: './node_modules/connectkit',
      react: './node_modules/react',
      'react-dom': './node_modules/react-dom',
      '@tanstack/react-query': './node_modules/@tanstack/react-query',
    },
  },
  env: {
    // API base URL for the backend.
    // Set NEXT_PUBLIC_API_URL in Vercel env vars:
    //   Production:  https://api.template.cfxdevkit.org
    //   Development: http://localhost:3002
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002',
    // App URL used in WalletConnect metadata. Must match the actual origin so
    // the "does not match current domain" viem error is avoided.
    // Set NEXT_PUBLIC_APP_URL in Vercel env vars:
    //   Production:  https://template.cfxdevkit.org
    //   Development: http://localhost:3000
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API URL for server components and client fetch.
  // Set NEXT_PUBLIC_API_URL in the Vercel project env vars:
  //   Production:  https://api.cas.cfxdevkit.org
  //   Development: http://localhost:3001
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: generate a plain HTML/JS/CSS bundle that Express will serve
  output: 'export',
  trailingSlash: true,
  // Disable image optimisation — not needed for a local dev tool
  images: { unoptimized: true },
};

export default nextConfig;

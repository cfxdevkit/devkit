const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: generate a plain HTML/JS/CSS bundle that Express will serve
  output: 'export',
  trailingSlash: true,
  // Emit relative asset URLs so the exported app also works behind /proxy/<port>/.
  assetPrefix: '.',
  // Disable image optimisation — not needed for a local dev tool
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    authInterrupts: true,
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
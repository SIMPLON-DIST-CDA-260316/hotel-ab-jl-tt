/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    authInterrupts: true,
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
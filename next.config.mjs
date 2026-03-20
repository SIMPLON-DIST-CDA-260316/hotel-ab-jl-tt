/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    authInterrupts: true,
    typedRoutes: true,
  },
};

export default nextConfig;
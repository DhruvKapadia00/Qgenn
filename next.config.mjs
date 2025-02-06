/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    },
    typedRoutes: true
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false
  }
}

export default nextConfig;

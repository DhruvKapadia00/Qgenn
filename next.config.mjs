/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
}

export default nextConfig;

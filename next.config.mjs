/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Tell Next.js NOT to bundle @libsql/client — let Vercel's Node.js runtime handle it natively
  serverExternalPackages: ['@libsql/client'],
}

export default nextConfig

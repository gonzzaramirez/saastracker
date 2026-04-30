/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Required for @libsql/client native binaries to be included in Vercel serverless bundle
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/@libsql/client/**/*'],
    '/': ['./node_modules/@libsql/client/**/*'],
  },
  serverExternalPackages: ['@libsql/client'],
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? `${apiUrl}/api/:path*`
          : 'http://localhost:3001/api/:path*',
      },
    ]
  },
  swcMinify: true,
  images: {
    domains: ['localhost', 'fixandfit.com'],
  },
}

module.exports = nextConfig

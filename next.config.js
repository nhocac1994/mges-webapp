/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '14.225.206.163'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:55777',
  },
  // Headers để hỗ trợ CORS và mixed content
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig


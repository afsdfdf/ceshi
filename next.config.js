/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['assets.coingecko.com', 'www.logofacade.com', 'www.iconaves.com', 'cryptologos.cc', 'example.com', 'api.dicebear.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com'
      },
      {
        protocol: 'https',
        hostname: 'www.logofacade.com'
      },
      {
        protocol: 'https',
        hostname: '**.ave-api.com'
      },
      {
        protocol: 'https',
        hostname: 'www.iconaves.com'
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc'
      },
      {
        protocol: 'https',
        hostname: 'example.com'
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com'
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com'
      },
      {
        protocol: 'https',
        hostname: 'dd.dexscreener.com'
      }
    ],
    unoptimized: true
  },
  output: 'standalone'
}

module.exports = nextConfig

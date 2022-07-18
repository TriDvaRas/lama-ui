/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false
    }
    return config
  },
}

module.exports = nextConfig

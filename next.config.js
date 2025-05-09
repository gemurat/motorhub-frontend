const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@react-pdf/renderer'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-pdf/renderer': '@react-pdf/renderer/dist/react-pdf.browser.es.js',
    }
    return config
  },
}

module.exports = nextConfig

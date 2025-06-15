/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development'
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_MCP_ENDPOINT: process.env.NEXT_PUBLIC_MCP_ENDPOINT || 'http://localhost:8000',
    NEXT_PUBLIC_MCP_AUTH_TOKEN: process.env.NEXT_PUBLIC_MCP_AUTH_TOKEN || '',
    NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE || 'true'
  },

  // API rewrites for backend integration
  async rewrites() {
    return [
      {
        source: '/api/agents/:path*',
        destination: `${process.env.NEXT_PUBLIC_MCP_ENDPOINT || 'http://localhost:8000'}/api/agents/:path*`
      },
      {
        source: '/api/workflows/:path*',
        destination: `${process.env.NEXT_PUBLIC_MCP_ENDPOINT || 'http://localhost:8000'}/api/workflows/:path*`
      }
    ]
  },

  // Webpack configuration for Monaco Editor and other dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  }
}

module.exports = nextConfig 
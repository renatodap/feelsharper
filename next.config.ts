import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Temporarily disable type checking in build for React 19 compatibility
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    domains: ['localhost', 'feelsharper.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-checkbox', 
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-radio-group',
      'framer-motion',
      '@supabase/ssr',
      '@supabase/supabase-js',
      'recharts',
      'date-fns',
      '@anthropic-ai/sdk',
      'openai',
      'stripe',
      'posthog-js',
      '@tanstack/react-query'
    ],
  },
  
  // SWC minification is now default in Next.js 15 (removed deprecated option)
  
  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Compression
  compress: true,

  // PWA support
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type', 
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimizations for bundle size
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 150000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Split framework chunk  
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Split large libs
          lib: {
            test(module: any) {
              return module.size() > 100000 &&
                /node_modules[/\\]/.test(module.identifier());
            },
            name(module: any) {
              const identifier = module.identifier();
              const parts = identifier.split('/');
              const nameIndex = parts.findIndex((part: string) => part === 'node_modules') + 1;
              return parts[nameIndex] || 'lib';
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Common chunks
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
        maxAsyncRequests: 10,
        maxInitialRequests: 10,
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);

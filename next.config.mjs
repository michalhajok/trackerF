/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Disable turbopack for stable production builds
  experimental: {
    // Remove turbo configuration
  },

  // API configuration to prevent CORS issues
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "/api/proxy/:path*",
      },
    ];
  },

  // Headers configuration for CORS
  async headers() {
    return [
      {
        source: "/api/proxy/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, X-Request-ID",
          },
        ],
      },
    ];
  },

  // Images configuration
  images: {
    domains: ["localhost"],
    // Remove unoptimized for production
  },

  // Webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = "eval-source-map";
    }

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }

    return config;
  },

  // Enable SWC minification for better performance
  swcMinify: true,

  // Output configuration
  output: "standalone",

  // Compression
  compress: true,
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
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

  // Disable strict mode temporarily for debugging
  reactStrictMode: false,

  // Images configuration if needed
  images: {
    domains: ["localhost"],
    unoptimized: true, // For development
  },

  // Webpack configuration for better debugging
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = "cheap-module-source-map";
    }
    return config;
  },
};

export default nextConfig;

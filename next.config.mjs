/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly use webpack (not Turbopack) for production builds
  // Turbopack doesn't support native modules like @tailwindcss/oxide
  turbopack: {},
  webpack: (config, { webpack }) => {
    // Ignore test files and directories in node_modules
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test$/,
        contextRegExp: /node_modules\/thread-stream$/,
      })
    );
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(test|spec)\.(js|ts|mjs)$/,
        contextRegExp: /node_modules/,
      })
    );

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "34.143.255.129",
        port: "8080",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "dweb.link",
        pathname: "/ipfs/**",
      },
    ],
  },
};

export default nextConfig;

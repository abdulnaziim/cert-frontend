import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url/"),
      zlib: require.resolve("browserify-zlib"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      assert: require.resolve("assert/"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
    };
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["10.191.187.47", "localhost", "127.0.0.1"],
};

export default nextConfig;

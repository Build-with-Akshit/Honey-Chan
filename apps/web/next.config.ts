import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // REL-03 fix: build-time type checking re-enabled (tsc is clean).
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: ["10.191.187.47", "localhost", "127.0.0.1"],
};

export default nextConfig;

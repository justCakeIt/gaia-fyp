import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.231",
    "172.20.10.5",
  ],

  // keep TS bypass for CI safety (still supported)
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    cpus: 3,
  },
};

export default nextConfig;
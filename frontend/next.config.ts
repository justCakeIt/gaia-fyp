import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    // Limit static-page workers to avoid OOM on constrained machines.
    // Default is Math.min(cpus, 15) which exhausts RAM during `next build`.
    cpus: 3,
  },
};

export default nextConfig;

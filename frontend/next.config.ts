import type { NextConfig } from "next";

const nextConfig: NextConfig = {
// Permit any private-network origin so the dev server works on any LAN/hotspot IP.
// Add new IPs here only if Next.js starts rejecting requests from a specific device.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.231",
    "172.20.10.5",
  ],

  experimental: {
    cpus: 3,
  },
};
// eslint AFTER typing (this avoids TS error)
(nextConfig as any).eslint = {
  ignoreDuringBuilds: true,
};

export default nextConfig;
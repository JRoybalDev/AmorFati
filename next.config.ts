import { hostname } from "os";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "arcon-api.duckdns.org"
      }
    ],
  },
};

module.exports = nextConfig;

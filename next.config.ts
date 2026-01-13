/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
};

module.exports = nextConfig;

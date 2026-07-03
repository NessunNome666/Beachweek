import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web-push è una libreria Node (usa crypto nativo): non va bundlata dal server build
  serverExternalPackages: ['web-push'],
};

export default nextConfig;

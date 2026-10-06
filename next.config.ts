import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Cloudflare Pages compatibility — don't bundle server-side externals
  // (Prisma + libsql need to be resolved at runtime, not bundled)
  serverExternalPackages: ["@prisma/client", "@libsql/client", "@prisma/adapter-libsql", "bcryptjs"],
  experimental: {
    // Required for Cloudflare Pages compatibility
    runtime: "nodejs",
  },
};

export default nextConfig;

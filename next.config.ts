import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Cloudflare Pages compatibility — Prisma/libsql/bcrypt are external Node deps
  // that get bundled by @cloudflare/next-on-pages via the nodejs-compat flag.
  serverExternalPackages: ["@prisma/client", "@libsql/client", "@prisma/adapter-libsql", "bcryptjs"],
};

export default nextConfig;

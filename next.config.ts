import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jsdom", "dompurify", "isomorphic-dompurify"],
};

export default nextConfig;
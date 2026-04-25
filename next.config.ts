import type { NextConfig } from "next";

const rawProxyTarget = process.env.MATH_EXPLAINER_PROXY_TARGET?.trim() ?? "http://localhost:8000";
const normalizedProxyTarget = rawProxyTarget.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/math-explainer/:path*",
        destination: `${normalizedProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;

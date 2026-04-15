import type { NextConfig } from "next";

const backendUrl = process.env.INTERNAL_API_URL || "http://django:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path(.*)",
          destination: `${backendUrl}/api/:path`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;

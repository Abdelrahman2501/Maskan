import type { NextConfig } from "next";

// Backend origin for the /api proxy. Server-side only; keeps cookies first-party (ADR-0002).
const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Dev server only: allow opening it from these hosts besides localhost
  // (otherwise its scripts are blocked and pages don't respond to clicks).
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.app"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;

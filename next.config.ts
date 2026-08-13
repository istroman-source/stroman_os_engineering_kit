import type { NextConfig } from "next";

export const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
] as const;

/**
 * Next.js configuration.
 *
 * Keep this file intentionally small. Environment access is centralized in
 * `src/lib/env` and must not be duplicated here. Build-time correctness is
 * enforced: we never ship with type or lint errors suppressed.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Fail the build on type errors. Never silence these. Linting runs as its
  // own CI step (`npm run lint`) rather than during the build.
  typescript: { ignoreBuildErrors: false },
  async headers() {
    return [{ source: "/:path*", headers: [...SECURITY_HEADERS] }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

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
};

export default nextConfig;

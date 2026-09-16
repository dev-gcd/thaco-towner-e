import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages (no SSR / API routes in this app).
  output: "export",
  // next/image with `loader: 'default'` requires the Next.js runtime, which
  // isn't available on a pure static host. `unoptimized` serves the source
  // files as-is from `public/`.
  images: { unoptimized: true },
  // Emit `/foo/index.html` so paths resolve cleanly on Cloudflare Pages.
  trailingSlash: true,
  // DEV ONLY: proxy the admin/leads API to the local CMS dev server
  // (scripts/cms-dev.mjs) so "Save"/"Upload" write straight to local files and
  // `next dev` hot-reloads. Returns [] for the production `output: 'export'`
  // build, where the real Cloudflare Worker handles these routes instead.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8790/api/:path*",
      },
    ];
  },
};

export default nextConfig;

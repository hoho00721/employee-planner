import type { NextConfig } from 'next';
import dotenv from 'dotenv';

dotenv.config({ path: '.env', override: true });

// ─── Capacitor / APK build detection ─────────────────────────────────────────
// Run `NEXT_EXPORT=1 pnpm build` to produce a fully static `out/` folder
// that Capacitor's `webDir` will pick up.
// Regular `pnpm build` keeps the Next.js server for web/PWA deployment.
const isCapacitorBuild = process.env.NEXT_EXPORT === '1';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },

  // Static export for Capacitor (APK build)
  ...(isCapacitorBuild && {
    output:    'export',
    trailingSlash: true,
    // API routes don't exist in a static export — the app uses IndexedDB
    // offline-db + direct server calls at runtime inside the WebView.
    // For full offline support swap to a bundled SQLite approach later.
  }),

  env: {
    PROJECT_ID:        process.env.HAPPYSEEDS_PROJECT_ID  ?? '',
    REACTUS_BASE_URL:  process.env.REACTUS_BASE_URL        ?? '',
    NEXT_PUBLIC_IS_CAPACITOR: isCapacitorBuild ? '1' : '0',
  },
  serverExternalPackages: [],
  allowedDevOrigins: ['**.*.*'],

  // Headers for PWA / Android WebView
  async headers() {
    if (isCapacitorBuild) return [];
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',    value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control',    value: 'public, max-age=3600' },
          { key: 'Content-Type',     value: 'application/manifest+json' },
        ],
      },
    ];
  },
};

export default nextConfig;

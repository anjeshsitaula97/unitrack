import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || '.next',
  // Next 16 blocks cross-origin requests to dev-only resources (e.g. the
  // /_next/hmr socket) unless the request hostname is listed here. Without
  // this, opening the app from a LAN IP or 127.0.0.1 loads the HTML but the
  // client runtime never hydrates, so client forms fall back to native submits.
  allowedDevOrigins: ['127.0.0.1', '192.168.*.*', '10.*.*.*', '*.local', '**.local'],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },

  images: {
    // The optimiser fetches /uploads/* server-side without the session cookie,
    // which both 401s on protected files and caches them into shared variants.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // @vladmandic/face-api resolves its tfjs backends with a dynamic require(),
  // which webpack cannot statically analyse. Known harmless false positive from
  // the HR face-enrollment feature; ignore only that exact message so any other
  // real warning still surfaces in the build output.
  webpack: (config) => {
    config.ignoreWarnings = [
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
    ];
    return config;
  },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: '/uploads/:path*', destination: '/api/uploads/:path*' },
      ],
      fallback: [],
    };
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline for hydration
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: https://images.unsplash.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: wss:", // Allow HTTPS and WSS only
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://rc-epay.esewa.com.np https://epay.esewa.com.np https://dev.connectips.com https://login.connectips.com",
      "object-src 'none'",
      "frame-src 'self' https://rc-epay.esewa.com.np https://epay.esewa.com.np https://dev.connectips.com https://login.connectips.com",
    ].join('; ');

    const uploadCsp = [
      "default-src 'none'",
      "img-src 'self' data:",
      "style-src 'unsafe-inline'",
      "sandbox",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: uploadCsp },
        ],
      },
    ];
  },
};
export default nextConfig;
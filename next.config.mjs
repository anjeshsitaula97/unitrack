import { imageHosts } from "./image-hosts.config.mjs";
import { createRequire } from "node:module";
// Pre-patch fs.readlink for Node v24 + Windows before webpack captures its
// internal fs reference (the platform check inside makes this a no-op on Linux).
createRequire(import.meta.url)("./scripts/patch-readlink.cjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  distDir: process.env.DIST_DIR || ".next",
  // Next 16 blocks cross-origin requests to dev-only resources (e.g. the
  // /_next/hmr socket) unless the request hostname is listed here. Without
  // this, opening the app from a LAN IP or 127.0.0.1 loads the HTML but the
  // client runtime never hydrates, so client forms fall back to native submits.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "*.local", "**.local"],
  experimental: {
    turbopackFileSystemCacheForDev: false,

    // Next.js defaults the page-data / static-generation worker count to
    // `os.cpus().length - 1`. Build hosts that report many cores but cap the
    // process/thread limit (Hostinger's container does) then spawn dozens of
    // workers at once and the OS refuses with EAGAIN ("OS can't spawn worker
    // thread", os error 11), aborting the build during "Collecting page data".
    // Cap the worker count; the value can be overridden per host.
    cpus: Number(process.env.NEXT_BUILD_CPUS) || 2,
  },

  images: {
    // The optimiser fetches /uploads/* server-side without the session cookie,
    // which both 401s on protected files and caches them into shared variants.
    unoptimized: true,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  },
  serverExternalPackages: ["@prisma/client", "prisma"],

  // @vladmandic/face-api resolves its tfjs backends with a dynamic require(),
  // which webpack cannot statically analyse. Known harmless false positive from
  // the HR face-enrollment feature; ignore only that exact message so any other
  // real warning still surfaces in the build output.
  webpack: (config) => {
    config.ignoreWarnings = [
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
    ];
    // Node v24 on Windows: enhanced-resolve readlink crashes (EISDIR bug).
    // Disable symlink resolution; project has no symlinks in src/.
    if (config.resolve) config.resolve.symlinks = false;
    return config;
  },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }],
      fallback: [],
    };
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== "production";

    // Remote origins the browser is actually allowed to talk to. Everything
    // else is served from this origin: logos, banners and avatars are uploaded
    // through /uploads/* and stored locally, so a blanket `https:` source was
    // never needed.
    const remoteImageOrigins = [
      "https://images.unsplash.com",
      "https://images.pexels.com",
      "https://images.pixabay.com",
      "https://img.rocket.new",
      "https://flagsapi.com",
      "https://flagcdn.com",
    ];

    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' is still required for scripts: Next.js emits an inline
      // bootstrap script per page and, without a nonce, the header cannot be
      // tightened further. Nonces are not an option here — they only apply to
      // dynamically rendered pages, and this app prerenders ~190 of them.
      // `script-src-attr 'none'` removes the inline-event-handler half of the
      // problem, and 'unsafe-eval' is only needed by React's dev-only
      // debugging (React and Next.js never eval in production).
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Was `https:`, which let any page pull an image from (and therefore
      // exfiltrate data to) an arbitrary origin.
      `img-src 'self' data: blob: ${remoteImageOrigins.join(" ")}`,
      "font-src 'self' data: https://fonts.gstatic.com",
      // The browser only calls this origin: payment gateways are contacted
      // server-side, and the local scanner bridge is a development tool.
      `connect-src 'self'${isDev ? " ws: wss: http://localhost:5899" : ""}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://rc-epay.esewa.com.np https://epay.esewa.com.np https://dev.connectips.com https://login.connectips.com",
      "object-src 'none'",
      // The university location map is embedded from Google Maps.
      "frame-src 'self' https://maps.google.com https://rc-epay.esewa.com.np https://epay.esewa.com.np https://dev.connectips.com https://login.connectips.com",
    ].join("; ");

    const uploadCsp = [
      "default-src 'none'",
      "img-src 'self' data:",
      "style-src 'unsafe-inline'",
      "sandbox",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [{ key: "Content-Security-Policy", value: uploadCsp }],
      },
    ];
  },
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.andripurnomo.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
    loader: "custom",
    loaderFile: "./src/utils/image-loader.ts",
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ["@stripe/stripe-js", "sonner"],
    webVitalsAttribution: ["CLS", "LCP", "FID", "FCP", "TTFB"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              `script-src 'self' 'unsafe-inline' ${
                isDev ? "'unsafe-eval'" : ""
              } https://js.stripe.com; ` +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https://cdn.andripurnomo.com; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://api.stripe.com; " +
              "frame-src https://js.stripe.com; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none'; " +
              `${isDev ? "" : "upgrade-insecure-requests;"}`,
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // COEP can break dev tools, only enable in production
          ...(isDev
            ? []
            : [
                {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "require-corp",
                },
              ]),
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache images
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

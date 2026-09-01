import type { NextConfig } from "next";

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "";

const config: NextConfig = {
  reactStrictMode: true,
  // Several lockfiles exist above this directory; pin the root so Next
  // stops inferring the wrong one.
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Curated development photography. Replaced by Supabase Storage
      // once real creator uploads exist.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Photowalks in Pune serves its own gallery; we link, not copy.
      { protocol: "https", hostname: "photowalks-in-pune-gold.vercel.app" },
      ...(SUPABASE_HOST
        ? [
            {
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default config;

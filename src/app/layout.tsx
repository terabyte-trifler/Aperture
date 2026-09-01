import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "APERTURE — access the gear, find your people, build your reputation",
    template: "%s · APERTURE",
  },
  description:
    "APERTURE is where India's visual creators rent gear, find collaborators, and build a professional reputation backed by real work.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Geist is the reference's face. Loaded by link rather than
            next/font so a missing entry in the bundled Google Fonts
            manifest degrades to Inter instead of failing the build. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-3 focus:text-ink-inverse"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

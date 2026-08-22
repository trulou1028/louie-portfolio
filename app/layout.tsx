import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { AppShell } from "@/components/app-shell/app-shell";
import { PersonSchema, WebSiteSchema } from "@/components/system/structured-data";
import { profile } from "@/content/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://louiesakoda.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.positioning.supporting,
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: `${profile.name} · ${profile.role}`,
    description: profile.positioning.supporting,
    url: siteUrl,
    locale: "en_US",
    // TODO(asset): a real 1200×630 share image (spec §28).
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.role}`,
    description: profile.positioning.supporting,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PersonSchema />
        <WebSiteSchema />
        <AppShell>{children}</AppShell>
        {/* Privacy-conscious, no cookies (spec §30). Event properties are
            guarded in lib/analytics.ts so free text can never be sent. */}
        <Analytics />
      </body>
    </html>
  );
}

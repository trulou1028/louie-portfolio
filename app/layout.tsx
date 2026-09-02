import type { Metadata } from "next";
import { Geist_Mono, Outfit, Roboto_Slab } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { AppShell } from "@/components/app-shell/app-shell";
import { PersonSchema, WebSiteSchema } from "@/components/system/structured-data";
import { profile } from "@/content/profile";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${geistMono.variable} ${robotoSlab.variable} h-full antialiased`}
    >
      <head>
        {/*
          Remembers the fragment the visitor actually asked for.

          A hash can arrive before the App Router hydrates — `navigate_portfolio`
          sets one client-side, and a pasted deep link raced by a slow network
          does the same. Two things then swallow it: the `hashchange` fires
          before any React effect is listening, and the router `replaceState`s
          its canonical URL over the top, erasing the fragment outright.

          It has to run before the router does. A module-scope capture inside
          a client component cannot promise that: chunk evaluation order
          shifts whenever the client graph changes, and it did — adding the
          diagram connectors was enough to start losing the race. An inline
          script executes while the parser is still in `<head>`, whereas every
          bundle chunk Next emits is `async` and cannot execute until it has
          been fetched, so this reliably wins. `DeepLinkHighlight` reads it
          back.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__deepLinkHash=location.hash;" +
              // Read the fragment off the event, not off `location`: the
              // router's replaceState can land between the hash being
              // assigned and `hashchange` being dispatched, in which case
              // `location.hash` is already empty by the time this runs.
              // `newURL` is what the navigation actually asked for.
              "addEventListener('hashchange',function(e){" +
              "var u=e.newURL||'',i=u.indexOf('#');" +
              "window.__deepLinkHash=i<0?'':u.slice(i);" +
              "},true);",
          }}
        />
      </head>
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

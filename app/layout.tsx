import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { JsonLd } from "@/components/shared/JsonLd";
import { organizationSchema } from "@/lib/schema";
import { getSettings } from "@/lib/db";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Live Music, Nightlife & Private Parties`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Live Music, Nightlife & Private Parties`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-ink-950 pb-16 lg:pb-0">
        <JsonLd data={organizationSchema()} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-bone-100 focus:px-4 focus:py-2 focus:text-ink-950">
          Skip to content
        </a>
        <Header whatsappNumber={settings.generalWhatsappNumber} />
        <main id="main-content">{children}</main>
        <Footer />
        <StickyMobileCTA whatsappNumber={settings.generalWhatsappNumber} />
        <CookieConsent />
        <AnalyticsScripts />
      </body>
    </html>
  );
}

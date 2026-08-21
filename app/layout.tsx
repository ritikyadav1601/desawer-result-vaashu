import type { Metadata } from "next";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Desawer Result Today | Live Satta King Result & Chart",
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Results",
  manifest: "/manifest.webmanifest",
  keywords: ["Desawer Result", "Satta King", "Gali Result", "Faridabad Result", "Ghaziabad Result"],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    title: "Desawer Result Today | Live Satta King Result & Chart",
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "en_IN",
    type: "website",
    images: [{ url: "/images/logo.png", width: 879, height: 87, alt: "Desawer Result" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Desawer Result Today | Live Satta King Result & Chart",
    description: defaultDescription,
    images: ["/images/logo.png"]
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "x2FBbxLcxHN5GisB2AU9yzLiihrggsihbU47i3N54TU"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

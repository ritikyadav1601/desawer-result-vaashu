import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://desawerresult.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Desawer Result Satta King | Fast & Accurate Satta Bazar Results Online",
  description: "Get latest Desawer result, live market updates, record charts, and monthly result tables in a simple mobile friendly layout.",
  keywords: ["Desawer Result", "Satta King", "Gali Result", "Faridabad Result", "Ghaziabad Result"],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Desawer Result Satta King",
    description: "Daily live result updates and monthly record charts.",
    url: siteUrl,
    siteName: "Desawer Result",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

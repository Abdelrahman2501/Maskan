import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";
import { LocaleProvider } from "@/i18n/locale-provider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maskan — Real Estate Agency",
    template: "%s · Maskan",
  },
  description:
    "Join Maskan, a professional virtual real estate agency in New Cairo. Get verified, trained, and connected to premium properties and qualified leads.",
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a", // token-lint-allow: metadata needs a literal (= --color-navy)
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${plexArabic.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

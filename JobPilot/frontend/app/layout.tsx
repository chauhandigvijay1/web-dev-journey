import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getThemeInitScript } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || process.env.NEXT_PUBLIC_SITE_URL || "https://jobpilot-client-chi.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "JobPilot — AI-Powered Job Application Tracker",
    template: "%s | JobPilot",
  },
  description:
    "Track every job application with Kanban boards, AI-powered cover letters, automated reminders, and a browser extension that saves jobs from 50+ portals in one click.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JobPilot — AI-Powered Job Application Tracker",
    description:
      "Build a calmer workflow for your job search with Kanban boards, AI tools, automated reminders, and a browser extension that saves from 50+ portals.",
    url: siteUrl,
    siteName: "JobPilot",
    locale: "en_US",
    type: "website",
    images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, type: "image/svg+xml" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobPilot — AI-Powered Job Application Tracker",
    description:
      "Kanban boards, AI cover letters, smart reminders, and a browser extension for 50+ job portals.",
    images: [`${siteUrl}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className={`${inter.variable} font-sans min-h-dvh`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

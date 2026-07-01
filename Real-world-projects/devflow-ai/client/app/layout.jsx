import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";

export const metadata = {
  title: {
    default: "DevFlow AI — AI-Powered Development Assistant",
    template: "%s | DevFlow AI",
  },
  description:
    "DevFlow AI is a premium SaaS platform that provides AI-powered chat assistance for modern developer workflows. Get real-time coding help, debugging, and code explanations.",
  keywords: [
    "AI coding assistant",
    "developer tools",
    "code explanation",
    "AI pair programmer",
    "DevFlow",
  ],
  authors: [{ name: "Digvijay Kumar Singh" }],
  creator: "Digvijay Kumar Singh",
  publisher: "DevFlow AI",
  metadataBase: new URL("https://devflow-ai-client.netlify.app"),
  openGraph: {
    title: "DevFlow AI — AI-Powered Development Assistant",
    description:
      "Premium AI chat platform for modern developer workflows with real-time coding assistance.",
    url: "https://devflow-ai-client.netlify.app",
    siteName: "DevFlow AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFlow AI — AI-Powered Development Assistant",
    description:
      "Premium AI chat platform for modern developer workflows with real-time coding assistance.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://devflow-ai-client.netlify.app",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased`}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

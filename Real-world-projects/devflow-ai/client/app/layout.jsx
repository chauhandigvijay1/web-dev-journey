import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";

export const metadata = {
  title: "DevFlow AI",
  description: "AI pair programmer for developers",
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

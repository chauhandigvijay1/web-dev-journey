import "./globals.css";
import Providers from "@/components/providers";
import Script from "next/script";

export const metadata = {
  title: "DevFlow AI",
  description: "AI pair programmer for developers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

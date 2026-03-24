import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getThemeInitScript } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "JobPilot",
  description: "JobPilot AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className={`${inter.variable} font-sans min-h-dvh`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

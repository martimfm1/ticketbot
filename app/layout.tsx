import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SILENTRA Ticket — Professional Discord Ticket Management",
  description:
    "Manage Discord support tickets professionally with SILENTRA Ticket. A modern web dashboard that replaces Discord commands with a premium SaaS experience.",
  keywords: ["Discord", "ticket", "support", "dashboard", "bot", "management"],
  authors: [{ name: "SILENTRA" }],
  openGraph: {
    title: "SILENTRA Ticket — Professional Discord Ticket Management",
    description:
      "Manage Discord support tickets professionally with a modern web dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SILENTRA Ticket — Professional Discord Ticket Management",
    description:
      "Manage Discord support tickets professionally with a modern web dashboard.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background antialiased`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeCheckTO | What's the Vibe in Toronto Tonight?",
  description: "Real-time club vibes in Toronto. Know before you go. Find the hottest spots, live reviews, and honest crowd reports.",
  openGraph: {
    title: "VibeCheckTO",
    description: "Know before you go. Real-time reports from Toronto's nightlife scene.",
    url: "https://vibecheckto.com",
    siteName: "VibeCheckTO",
    images: [
      {
        url: "https://vibecheckto.com/meta-image.png",
        width: 1200,
        height: 630,
        alt: "VibeCheckTO - Toronto Nightlife",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeCheckTO",
    description: "Know before you go. Real-time reports from Toronto's nightlife scene.",
    images: ["https://vibecheckto.com/meta-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["Toronto", "nightlife", "clubs", "bars", "vibes", "reviews", "real-time"],
  authors: [{ name: "VibeCheckTO" }],
  creator: "VibeCheckTO",
  publisher: "VibeCheckTO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

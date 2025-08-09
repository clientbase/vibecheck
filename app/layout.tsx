import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import type { Session } from "next-auth";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

function Header({ session }: { session: Session | null }) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 border-b bg-background">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <img src="/Smiling Emoji with CN Tower.png" alt="VibeCheckTO Logo" className="w-16 h-16 rounded" />
        VibeCheckTO
      </Link>
      <div>
        {!session?.user ? (
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-foreground max-w-[140px] truncate">{session.user.name || session.user.email}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none flex items-center">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={session.user.image || undefined} alt="User avatar" className="w-10 h-10" />
                    <AvatarFallback>{session.user.name ? session.user.name[0] : "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <form action="/api/auth/signout" method="post">
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full text-left">Sign Out</button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
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
        <Header session={session} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pixel fonts for retro game theme
const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const vt323 = VT323({
  variable: "--font-pixel-body",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GenLayer Event Alarm - Weekly Schedule",
  description: "Simple alarm and schedule for GenLayer weekly events. Track events, countdown timers, and role system.",
  keywords: ["GenLayer", "Events", "Alarm", "Schedule", "Web3", "Blockchain"],
  authors: [{ name: "GenLayer Community" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    other: [
      { rel: "icon", url: "/icon-48.png", type: "image/png", sizes: "48x48" },
    ],
  },
  openGraph: {
    title: "GenLayer Event Alarm",
    description: "Track GenLayer weekly events with countdown timer",
    type: "website",
    images: ["/icon-512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "GenLayer Event Alarm",
    description: "Track GenLayer weekly events with countdown timer",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${vt323.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

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
    icon: "/logo.svg",
  },
  openGraph: {
    title: "GenLayer Event Alarm",
    description: "Track GenLayer weekly events with countdown timer",
    type: "website",
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
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

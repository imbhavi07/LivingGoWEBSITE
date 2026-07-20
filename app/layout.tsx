import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito, Quicksand } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClerkSessionSync } from "@/components/ClerkSessionSync";
import { ToastProvider } from "@/contexts/ToastContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ServiceWorkerRegistry from "@/components/ServiceWorkerRegistry";
import IntroOverlay from "@/components/IntroOverlay";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import ClerkSessionWrapper from "@/components/ClerkSessionWrapper";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LivingGo Student Housing",
  description: "Find verified student housing, PGs, rooms, flats, and residences near your college",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${nunito.variable} ${quicksand.variable} font-sans antialiased`}>
        {/* THE FIX: Moved IntroOverlay inside body so it renders cleanly in the DOM tree */}
        <IntroOverlay />

        <ClerkProvider afterSignOutUrl="/">
          <ToastProvider>
            <AuthProvider>
              <ClerkSessionWrapper />
              <ServiceWorkerRegistry />
              <AppChrome>{children}</AppChrome>
            </AuthProvider>
          </ToastProvider>
        </ClerkProvider>
        <WhatsAppButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
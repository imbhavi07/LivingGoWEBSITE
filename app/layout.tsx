import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClerkSessionSync } from "@/components/ClerkSessionSync";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";
// Clean named import matching our exact component signature
import ServiceWorkerRegistry from "@/components/ServiceWorkerRegistry"; 
import IntroOverlay from "@/components/IntroOverlay";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "LivingGo Student Housing",
  description: "Find verified student housing, PGs, rooms, flats, and residences near your college",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-512.png'
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* THE FIX: Moved IntroOverlay inside body so it renders cleanly in the DOM tree */}
        <IntroOverlay />
        
        <ClerkProvider afterSignOutUrl="/">
          <ToastProvider>
            <AuthProvider>
              <ClerkSessionSync />
              <ServiceWorkerRegistry />
              <AppChrome>{children}</AppChrome>
            </AuthProvider>
          </ToastProvider>
        </ClerkProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
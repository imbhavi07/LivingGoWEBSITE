import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClerkSessionSync } from "@/components/ClerkSessionSync";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";
import IntroOverlay from "@/components/IntroOverlay";
import ServiceWorkerRegistry from "@/components/ServiceWorkerRegistry"; // Add this import
import { InstallPrompt } from "@/components/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "LivingGo Student Housing",
  description: "Find verified student housing, PGs, rooms, flats, and residences near your college",
  // Next.js 13+ Metadata standards
  // ab shayad ho jana chahiye PWA ka scene fix
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
        <ClerkProvider
          afterSignOutUrl="/"
        >
          <IntroOverlay />
          <ToastProvider>
            <AuthProvider>
              <ClerkSessionSync />
              {/* Add ServiceWorkerRegistry component */}
              <ServiceWorkerRegistry />
              <InstallPrompt />
              <AppChrome>{children}</AppChrome>
            </AuthProvider>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
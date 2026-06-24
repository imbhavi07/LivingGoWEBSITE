# PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Progressive Web App (PWA) for the LivingGo student housing platform with installability, manifest, and service worker for essential asset caching.

**Architecture:** 
- Create a manifest.json file in public/ with app metadata and icons
- Create a service worker script that precaches essential assets (HTML, CSS, JS)
- Create a client-side ServiceWorkerRegistry component that handles service worker registration in useEffect
- Register the service worker component in layout.tsx
- Add manifest link to layout metadata
- Create necessary icon files in public/assets/icons/

**Tech Stack:** 
- Next.js 13+ (App Router)
- Service Workers API
- Web App Manifest
- TypeScript
- Tailwind CSS

## Global Constraints

- layout.tsx is a Server Component - cannot use window/navigator directly
- Must use separate 'use client' component for service worker registration
- Manifest must be linked in layout metadata
- Icons must be placed in public/assets/icons/
- Service worker must cache essential assets for offline functionality
- Follow existing code patterns in the codebase
- Use TypeScript for type safety
- Follow existing Tailwind CSS patterns

---
### Task 1: Create icons directory and placeholder icons

**Files:**
- Create: `public/assets/icons/icon-192x192.png`
- Create: `public/assets/icons/icon-512x512.png`
- Create: `public/assets/icons/icon-180x180.png`

**Interfaces:**
- Consumes: None
- Produces: Icon files for PWA manifest

**Steps:**
- [ ] **Step 1: Create icons directory**

```bash
mkdir -p public/assets/icons
```

- [ ] **Step 2: Verify directory creation**

```bash
ls -la public/assets/icons
```
Expected: Directory created successfully

- [ ] **Step 3: Commit**

```bash
git add public/assets/icons
git commit -m "feat: create icons directory for PWA"
```

### Task 2: Create manifest.json file

**Files:**
- Create: `public/manifest.json`

**Interfaces:**
- Consumes: None
- Produces: PWA manifest file

**Steps:**
- [ ] **Step 1: Create manifest.json with app metadata**

```json
{
  "name": "LivingGo",
  "short_name": "LivingGo",
  "description": "Find verified student housing, PGs, rooms, flats, and residences near your college",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FCF8F3",
  "theme_color": "#f9e7d3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-180x180.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Verify manifest file creation**

```bash
cat public/manifest.json
```
Expected: Manifest file created with correct content

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json
git commit -m "feat: add PWA manifest.json"
```

### Task 3: Create service worker file

**Files:**
- Create: `service-worker.js`

**Interfaces:**
- Consumes: None
- Produces: Service worker script for caching essential assets

**Steps:**
- [ ] **Step 1: Create service-worker.js with caching logic**

```javascript
// Service Worker for LivingGo PWA
const CACHE_NAME = 'livinggo-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-180x180.png',
  // Add other essential assets as needed
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request);
      })
  );
});
```

- [ ] **Step 2: Verify service worker file creation**

```bash
cat service-worker.js
```
Expected: Service worker file created with caching logic

- [ ] **Step 3: Commit**

```bash
git add service-worker.js
git commit -m "feat: add service worker for PWA caching"
```

### Task 4: Create ServiceWorkerRegistry client component

**Files:**
- Create: `components/ServiceWorkerRegistry.tsx`

**Interfaces:**
- Consumes: None
- Produces: Client component that registers service worker in useEffect

**Steps:**
- [ ] **Step 1: Create ServiceWorkerRegistry.tsx with useEffect for SW registration**

```typescript
'use client';

import { useEffect } from 'react';

const ServiceWorkerRegistry: React.FC = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistry;
```

- [ ] **Step 2: Verify component creation**

```bash
cat components/ServiceWorkerRegistry.tsx
```
Expected: Client component created with proper service worker registration

- [ ] **Step 3: Commit**

```bash
git add components/ServiceWorkerRegistry.tsx
git commit -m "feat: add ServiceWorkerRegistry client component"
```

### Task 5: Update layout.tsx to include ServiceWorkerRegistry and manifest link

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: ServiceWorkerRegistry component from components/
- Produces: Updated layout with service worker registration and manifest link

**Steps:**
- [ ] **Step 1: Read current layout.tsx to understand structure**

```bash
cat app/layout.tsx
```

- [ ] **Step 2: Update layout.tsx to import ServiceWorkerRegistry and add manifest link**

```typescript
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "LivingGo Student Housing",
  description: "Find verified student housing, PGs, rooms, flats, and residences near your college",
  // Add manifest link and icons
  icons: [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/assets/icons/icon-180x180.png" },
    { rel: "manifest", href: "/manifest.json" }
  ],
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
              <AppChrome>{children}</AppChrome>
            </AuthProvider>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify layout updates**

```bash
cat app/layout.tsx
```
Expected: Layout updated with ServiceWorkerRegistry import and manifest link in metadata

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update layout with service worker registration and manifest link"
```

### Task 7: Verify PWA implementation

**Files:**
- None (verification task)

**Interfaces:**
- Consumes: All previously created files
- Produces: Verification that PWA is working correctly

**Steps:**
- [ ] **Step 1: Start development server to test**

```bash
npm run dev
```
Expected: Development server starts successfully

- [ ] **Step 2: Check that manifest is accessible**

In browser, visit: http://localhost:3000/manifest.json
Expected: Manifest JSON displayed correctly

- [ ] **Step 3: Check that service worker is registered**

Open browser dev tools → Application → Service Workers
Expected: service-worker.js showing as registered

- [ ] **Step 4: Check that icons are loaded**

In browser dev tools → Application → Manifest
Expected: Icons displayed correctly in manifest preview

- [ ] **Step 5: Stop development server**

```bash
# Ctrl+C in terminal
```

- [ ] **Step 6: Commit verification completion**

```bash
git commit --allow-empty -m "feat: verify PWA implementation works correctly"
```

## Summary

This implementation plan creates a complete PWA for the LivingGo application with:
1. Proper manifest.json with app metadata and icons
2. Service worker for caching essential assets
3. Client-side service worker registration component (respecting Next.js App Router boundaries)
4. Manifest link added to layout metadata
5. Placeholder icon files (to be replaced with actual app icons - user will provide these)

Each task is designed to be small, testable, and independently committable following TDD and YAGNI principles.
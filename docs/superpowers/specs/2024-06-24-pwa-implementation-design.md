# PWA Implementation Design Document

## Overview
Implement Progressive Web App (PWA) functionality for the LivingGo Student Housing Next.js application to enable users to install the app on their home screens and access essential features offline.

## Design Decisions

### 1. PWA Configuration
- **App Name**: LivingGo
- **Theme Color**: #f9e7d3 (Oat color from Tailwind config)
- **Background Color**: #FCF8F3 (Linen color from Tailwind config)
- **Display Mode**: standalone
- **Orientation**: portrait-primary

### 2. Icon Placement
Place icon files in `/public/assets/icons/` with the following sizes:
- 192x192.png
- 512x512.png
- 180x180.png (for iOS)
- Other standard PWA sizes as needed

### 3. Implementation Approach
**Basic PWA** with:
- `manifest.json` in `/public/`
- Custom service worker for caching essential assets only
- Registration in `layout.tsx` or a dedicated service worker registration file

### 4. Service Worker Strategy
Cache essential assets for offline functionality:
- HTML documents
- CSS files
- JavaScript bundles
- Essential images (logos, icons)
- Font files

Exclude dynamic content and API responses from caching to ensure fresh data.

### 5. File Structure
```
/public
  /manifest.json
  /assets/icons/
    icon-192x192.png
    icon-512x512.png
    apple-touch-icon.png
/service-worker.js
/app/layout.tsx (service worker registration)
```

### 6. Implementation Details

#### manifest.json
```json
{
  "name": "LivingGo Student Housing",
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
      "src": "/assets/icons/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker Registration
Add to `app/layout.tsx` in the `<head>` section or use a `useEffect` in a client component:
```javascript
// In a client component or useEffect
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

#### Service Worker (service-worker.js)
```javascript
const CACHE_NAME = 'livinggo-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/apple-touch-icon.png',
  // Add essential CSS/JS files as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## Success Criteria
1. Users can install the app from browser menu/install prompt
2. App launches in standalone mode (no browser UI)
3. Essential assets are cached for offline access
4. App manifests correctly with specified name, colors, and icons
5. Service worker registers successfully without errors

## Files to Create/Modify
1. Create `/public/manifest.json`
2. Create `/public/assets/icons/` directory and place icon files
3. Create `/service-worker.js`
4. Modify `/app/layout.tsx` to register service worker
5. Update Tailwind config if needed (colors already defined)

## Next Steps
Upon approval, I will proceed with implementation using the writing-plans skill to create a detailed implementation plan.
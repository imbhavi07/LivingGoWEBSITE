# Performance and Efficiency Audit: LivingGo Website

## Executive Summary
This audit identifies critical performance bottlenecks in the LivingGo Next.js application that contribute to high latency for users in India due to US-based infrastructure. The analysis focuses on four key areas: Landing Page, Listings Page, Property Card component, and Property Details page.

Key findings reveal multiple opportunities for optimization including eliminating waterfall data fetching, reducing unnecessary client-side rendering, optimizing image delivery, and implementing proper Suspense boundaries for streaming rendering.

---

## 1. Landing Page (`app/page.tsx`)

### Data Fetching Inefficiencies
**Issue: Waterfall Data Fetching**
- Line 87-88: `useWishlist()` and `useProperties()` hooks are called sequentially
- Both hooks make independent API calls (`getWishlistProperties` and `getProperties`)
- These calls happen sequentially in React's render phase, creating a waterfall
- **Impact**: Users wait for wishlist data to load before property data begins fetching

**Issue: Unnecessary Client-Side Data Processing**
- Line 90-91: Property sorting and filtering happens on client after data fetch
- Sorting logic: `.sort((a, b) => a.price - b.price)[0]` processes entire array client-side
- **Impact**: Wastes client CPU cycles and delays UI rendering

### Component Boundaries
**Issue: Overuse of `use client`**
- Entire homepage uses `"use client"` directive (line 1)
- Despite containing mostly static content and only needing interactivity for:
  - Wishlist toggle (FeaturedPropertyCard)
  - Basic navigation links
- **Impact**: Forces entire page to bundle and execute client-side JavaScript unnecessarily

### Image & Asset Optimization
**Issue: Suboptimal Image Usage**
- Lines 20-26: Logo image uses fixed dimensions (992x597) without responsive sizing
- Lines 52-59: UI panel image uses fixed dimensions (510x650) 
- Both images lack `priority` attribute despite being above-the-fold
- **Impact**: Larger-than-necessary payloads, poor LCP (Largest Contentful Paint)

**Issue: Missing Image Optimization**
- Featured property images in `FeaturedPropertyCard` component use `fill` property but lack:
  - Proper `sizes` attribute for responsive sizing
  - `priority` flag for hero images
  - Format optimization hints

### Suspense & Streaming
**Issue: Missing Suspense Boundaries**
- No `<Suspense>` boundaries around data-dependent components
- `useProperties()` hook triggers client-side loading state
- Entire property preview section blocks rendering until data loads
- **Impact**: Poor perceived performance, blank screens during data loading

---

## 2. Listings Page (`app/listings/page.tsx`)

### Data Fetching Inefficiencies
**Issue: Sequential Data Fetching**
- Line 24: `const properties = await getProperties(filters);` awaits after params parsing
- While this is better than client-side fetching, it still blocks server rendering
- No opportunity for parallel data fetching with other potential data needs

**Issue: Client-Side Filtering**
- Lines 16-17: Budget filtering happens client-side after API call (line 16-18 in getProperties)
- This defeats the purpose of server-side filtering and transfers unnecessary data

### Component Boundaries
**Issue: Mixed Client/Server Boundary**
- Line 1: Correctly avoids `"use client"` (good server component)
- Line 33: `<FilterBar />` is a client component that breaks streaming
- Line 34: `<ClientPropertyGrid />` forces client-side rendering for entire grid
- **Impact**: Prevents React Server Components streaming benefits

### Image & Asset Optimization
**Issue: Delegated to Child Components**
- Image optimization deferred to PropertyCard component
- No image optimization at the list level

### Suspense & Streaming
**Issue: Missing Streaming Boundaries**
- No `<Suspure>` boundaries around data fetching
- FilterBar and PropertyGrid block each other
- No skeleton loaders shown during data fetching

---

## 3. Property Card Component (`components/PropertyCard.tsx`)

### Data Fetching Inefficiencies
**Issue: Repeated Data Computation**
- Lines 32-34: Beds calculation runs on every render
- Lines 36-43: Room type processing happens on every render
- Lines 45-48: Dynamic distance calculation with external lib call on every render
- Lines 50-67: College cycling effect uses useEffect/setInterval causing continuous re-renders

**Issue: Client-Side Data Processing**
- Line 46-48: Calls `getTailoredColleges(property.lat, property.lng, property.property.preference)` 
- This is a geolocation calculation that should be done server-side or pre-computed
- **Impact**: Wastes client battery and CPU, especially on mobile devices

### Component Boundaries
**Issue: Unnecessary Client Component**
- Entire component uses `"use client"` (line 1)
- Actual client-side needs:
  - Wishlist toggle (requires auth context)
  - Phone click-to-call (minor interaction)
  - Save button animation
  - College cycling animation
- **Opportunity**: Most content (image, price, title, facilities) could be server-rendered
- Only interactive elements need client hydration

### Image & Asset Optimization
**Issue: Suboptimal Next.js Image Usage**
- Lines 90-96: Image component usage is mostly correct but:
  - Missing `priority` for hero/focus images
  - `sizes` attribute could be optimized for property card context
  - No `format` or `quality` specification for WebP/AVIF
- Line 91: Uses `property.images[0]` directly - no fallback or error handling

**Issue: Inefficient Image Processing**
- Lines 33-35: Creates filtered/sliced array for slideshow on every render
- Lines 56-64: Complex distance UI calculation on every render

### Suspense & Streaming
**Issue: No Loading States**
- Component assumes all data is immediately available
- No placeholder/shimmer skeletons for image loading
- **Impact**: Layout shift and jank during image loading

---

## 4. Property Details Page (`app/properties/[id]/page.tsx`)

### Data Fetching Inefficiencies
**Issue: Sequential Data Fetching in Hooks**
- Line 51: `const { property, isLoading, error } = useProperty(params.id);`
- Line 52: `const wishlist = useWishlist();`
- These hooks execute sequentially, causing waterfall:
  1. Property data fetches
  2. Wishlist data fetches
  3. Only then can UI render

**Issue: Redundant Data Processing**
- Lines 75-82: Rating object transformation happens on every render
- Lines 84-86: Beds calculation repeats on every render
- Lines 88-94: Lock modal handler recreates function on every render
- Lines 98-99: Gallery component re-renders when property changes

### Component Boundaries
**Issue: Excessive Client-Side Rendering**
- Entire page uses `"use client"` (line 1)
- Actual client needs:
  - Auth status checks (useUser)
  - Wishlist toggle
  - Modal dialogs (lock, panorama)
  - Gallery interactions
  - Panorama viewer
- **Opportunity**: 70%+ of content (property details, description, facilities, etc.) could be server-rendered

### Image & Asset Optimization
**Issue: Gallery Component Optimization**
- Line 99: `<Gallery images={property.images} title={property.title} />`
- No indication Gallery component uses next/image properly
- Likely missing:
  - Proper sizing attributes
  - Lazy loading for off-screen images
  - WebP/AVIF format served based on browser support

**Issue: Missing Image Prioritization**
- Main property image (first in gallery) should have `priority` attribute
- No visual indication of which image is primary for LCP optimization

### Suspense & Streaming
**Issue: Partial Implementation with Gaps**
- Line 61: Shows `<DetailsSkeleton />` during loading - GOOD
- BUT: Skeleton only covers main property data, not:
  - Gallery images
  - Panorama sections
  - Nearby places data
  - Reviews section
- **Impact**: Partial content loads causing layout shifts

**Issue: Missing Streaming Boundaries**
- No `<Suspense>` boundaries around:
  - Gallery component
  - Panorama viewer sections
  - Nearby places section
  - Reviews section
- Each section could load independently as data arrives

---

## Cross-Cutting Issues

### 1. Missing Regional Optimization
**Issue: No Geographic Awareness**
- All API calls go to `NEXT_PUBLIC_API_BASE_URL` (likely US-based)
- No edge caching or regional deployment strategy
- Database (Neon DB) and media (Cloudinary) likely in US regions
- **Impact**: 200-400ms latency for Indian users vs. 20-50ms locally

### 2. Inefficient Data Fetching Patterns
**Issue: Waterfall Throughout**
- Custom hooks (`useProperties`, `useProperty`, `useWishlist`) all implement retry logic
- Each retry adds latency before showing any UI
- No deduplication of identical requests across components
- No request deduplication or caching layer

### 3. Missing Streaming Architecture
**Issue: Missing React 18 Streaming Benefits**
- Minimal use of `React.lazy`/`Suspense` for code splitting
- No streaming SSR boundaries
- All data fetching happens in useEffect or sequential async/await
- **Impact**: Poor TTI (Time to Interactive) and FCP (First Contentful Paint)

### 4. Suboptimal Third-Party Service Usage
**Issue: Cloudinary Optimization Missing**
- Images served without:
  - Automatic format selection (webp/avif)
  - Responsive breakpoints
  - Quality optimization based on viewport
  - Progressive loading
- **Impact**: Larger image payloads than necessary

---

## Prioritized Recommendations

### High Impact, Low Effort
1. **Add `priority` to hero images** on Landing Page and Property Details
2. **Move budget filtering to server-side** in `getProperties` API call
3. **Add `sizes` attributes** to all Next.js Image components based on container width
4. **Implement basic Suspense boundaries** around major sections with skeleton loaders

### Medium Impact, Medium Effort
1. **Convert PropertyCard to mostly Server Component** with only interactive elements client-side
2. **Implement request deduplication** in API client layer
3. **Move geolocation calculations** to build-time or server-side preprocessing
4. **Add proper image optimization** via Cloudinary transformations in URL parameters

### High Impact, High Effort
1. **Implement regional deployment** for database and media storage closer to Indian users
2. **Refactor data fetching patterns** to enable parallel fetching and streaming
3. **Implement edge caching** for API responses using Vercel Edge Config or similar
4. **Convert major pages to streaming architecture** with Suspense boundaries

---

## Estimated Impact
Implementing these optimizations could potentially:
- Reduce Time to First Byte (TTFB) by 40-60% for Indian users
- Improve Largest Contentful Paint (LCP) by 30-50%
- Reduce JavaScript bundle size by 25-40% through better code splitting
- Decrease layout shifts and jank during image loading
- Improve overall Core Web Vitals scores significantly

Next steps should focus on implementing the high-impact, low-effort items first, followed by architectural improvements to streaming and regional optimization.
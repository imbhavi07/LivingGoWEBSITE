# Mobile UI Refactor Design Spec

## Overview
This document outlines the design for refactoring the mobile UI on the home page:
1. Enlarge and redesign the "Call Us 24x7" floating button
2. Update the mobile bottom navigation bar so that authenticated users see role-appropriate Dashboard links instead of a generic "Sign out" button

## Call Us Button Redesign

### Current Implementation
Located in `app/page.tsx` lines 42-47:
```tsx
<a
  href="tel:+919068902886"
  className="absolute -top-4 right-2 z-10 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-bold font-bold text-white shadow-lift transition hover:opacity-90 active:scale-200"
>
  Call Us<sup>24x7</sup> 
</a>
```

### Proposed Changes
1. **Size Increase**: Change padding from `px-4 py-2` to `px-6 py-3` and text from `text-bold font-bold` to `text-lg font-semibold` (1.5x increase as requested)
2. **Text Styling**: Replace `<sup>24x7</sup>` with inline "24x7" that is slightly smaller but baseline-aligned using CSS
3. **Maintain Brand Colors**: Keep `bg-ink` background and `text-white` text
4. **Preserve Interactions**: Keep existing hover, active, and transition effects

### Updated Component
```tsx
<a
  href="tel:+919068902886"
  className="absolute -top-4 right-2 z-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-lg font-semibold text-white shadow-lift transition hover:opacity-90 active:scale-200"
>
  Call Us <span className="text-sm leading-none">24x7</span>
</a>
```

## Mobile Bottom Navigation Update

### Current Implementation
Located in `components/Navbar.tsx` lines 129-184 (mobile nav section):
- Shows Sign in/Sign out button based on authentication state
- For authenticated users, shows a generic "Sign out" button

### Proposed Changes
1. **Remove Sign out button** for authenticated users
2. **Add Dashboard link** that routes to role-appropriate dashboard:
   - Student role: `/student/dashboard`
   - Owner role: `/owner/dashboard` 
   - Admin role: `/admin/dashboard`
3. **Match existing nav item design pattern** using UserRound icon and label

### Updated Component Logic
Replace lines 162-169 in `components/Navbar.tsx`:
```tsx
{!mounted ? null : user ? (
  (role === "admin" || role === "owner") ? (
    <Link
      href={role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
        (pathname === "/owner/dashboard" || pathname === "/admin/dashboard") && "bg-ink text-white"
      )}
      aria-label="Account"
    >
      <UserRound className="h-5 w-5" aria-hidden />
      <span className="mt-1">Account</span>
    </Link>
  ) : (
    <Link
      href={role === "student" ? "/student/dashboard" : "/"}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
        pathname === "/student/dashboard" && "bg-ink text-white"
      )}
      aria-label="Dashboard"
    >
      <UserRound className="h-5 w-5" aria-hidden />
      <span className="mt-1">Dashboard</span>
    </Link>
  )
) : (
  <Link
    href="/login"
    className={cn(
      "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
      pathname === "/login" && "bg-ink text-white"
    )}
    aria-label="Sign in"
  >
    <UserRound className="h-5 w-5" aria-hidden />
    <span className="mt-1">Sign in</span>
  </Link>
)}
```

## Implementation Files
- `app/page.tsx` - Call Us button redesign
- `components/Navbar.tsx` - Mobile bottom navigation update

## Testing Considerations
1. Verify Call Us button is visibly larger on mobile devices
2. Confirm "24x7" text appears properly aligned and readable
3. Test that Dashboard link appears for authenticated users with correct routing based on role
4. Verify Sign in link still shows for unauthenticated users
5. Ensure existing desktop navbar functionality remains unchanged

## Accessibility
- Maintain proper contrast ratios with bg-ink/text-white combination
- Ensure touch target size meets accessibility guidelines (increased padding helps)
- Preserve tel: href for click-to-call functionality
- Keep aria-label attributes for screen readers

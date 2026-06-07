# Mobile Navigation Refactor Design

## Overview
This document outlines the refactoring of the mobile bottom navigation and the addition of a sign out button to the mobile sidebar/drawer menu.

## Problem Statement
1. The mobile bottom navigation in `components/Navbar.tsx` has redundant ternary logic for handling different user roles (admin, owner, student) when displaying the dashboard link.
2. The mobile sidebar/drawer menu lacks a sign out button that matches the functionality available in the desktop sidebar.

## Solution Approach

### 1. Mobile Bottom Navigation Refactor
**Location:** `components/Navbar.tsx` (lines 150-176)

**Current Implementation:**
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
      href="/student/dashboard"
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

**Proposed Implementation:**
```tsx
{!mounted ? null : user ? (
  <Link
    href={role === "admin" ? "/admin/dashboard" : role === "owner" ? "/owner/dashboard" : "/student/dashboard"}
    className={cn(
      "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
      pathname.includes("/dashboard") && "bg-ink text-white"
    )}
    aria-label="Dashboard"
  >
    <UserRound className="h-5 w-5" aria-hidden />
    <span className="mt-1">Dashboard</span>
  </Link>
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

**Benefits:**
- Eliminates redundant ternary nesting
- Single source of truth for dashboard link
- Consistent "Dashboard" label for all roles (as requested)
- Proper active state detection using `pathname.includes("/dashboard")`
- Maintains all existing functionality

### 2. Mobile Sidebar Sign Out Addition
**Location:** `components/student/StudentShell.tsx` (and similarly for owner/admin shells)

**Current Mobile Drawer Implementation:**
```tsx
{open ? (
  <div className="fixed inset-0 z-50 lg:hidden">
    <button className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Close menu" />
    <aside className="absolute inset-y-0 left-0 w-[82vw] max-w-80 bg-white p-5 shadow-lift">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xl font-black text-ink">LivingGo Student</p>
        <button className="rounded-2xl bg-linen p-3" onClick={() => setOpen(false)} aria-label="Close student menu">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <StudentSidebar onNavigate={() => setOpen(false)} onSignOut={signOut} />
    </aside>
  </div>
) : null}
```

**StudentSidebar Component (current):**
```tsx
function StudentSidebar({ onNavigate, onSignOut }: { onNavigate?: () => void; onSignOut: () => void }) {
  // ... existing code ...
  return (
    <div className="flex h-full flex-col">
      {/* ... existing links ... */}
      <nav className="mt-6 space-y-2">
        {/* ... navigation links ... */}
      </nav>
      <Button variant="ghost" className="mt-auto justify-start px-4" onClick={onSignOut}>
        <LogOut className="h-5 w-5" aria-hidden />
        Sign out
      </Button>
    </div>
  );
}
```

**Proposed Changes:**
1. The `StudentSidebar` component already has a sign out button at the bottom (lines 100-103), so no changes needed there.
2. However, we need to ensure the Owner and Admin shells also have similar mobile drawer implementations with sign out buttons.

**OwnerShell.tsx and AdminShell.tsx Current State:**
These files need to be checked to ensure they have mobile drawer implementations with sign out buttons similar to StudentShell.

**Implementation for Owner/Admin Shells:**
If missing, add similar mobile drawer implementation to:
- `components/owner/OwnerShell.tsx`
- `components/admin/AdminShell.tsx`

Each should include:
1. Mobile drawer button in header (lg:hidden)
2. Drawer/aside component that appears on mobile
3. Sidebar component with sign out button at the bottom (using the same pattern as StudentSidebar)

**Styling:**
- Use `Button variant="ghost"` with `LogOut` icon and "Sign out" text
- Position at bottom of drawer using `mt-auto` (flex container)
- Match desktop sidebar styling exactly

## Implementation Files
1. `components/Navbar.tsx` - Refactor mobile bottom navigation
2. `components/student/StudentShell.tsx` - Verify mobile drawer has sign out (likely already present)
3. `components/owner/OwnerShell.tsx` - Add mobile drawer with sign out if missing
4. `components/admin/AdminShell.tsx` - Add mobile drawer with sign out if missing

## Testing Considerations
1. Verify all role types (admin, owner, student) show correct dashboard href
2. Verify active state works correctly when on dashboard pages
3. Verify mobile drawer opens/closes correctly
4. Verify sign out button functions correctly in mobile drawer
5. Verify desktop functionality remains unchanged
6. Test responsive behavior across breakpoints

## Accessibility
- Maintain existing aria-labels and accessibility features
- Ensure touch targets are appropriately sized for mobile
- Maintain keyboard navigation support

## Styling Consistency
- Use existing `cn` utility for class name merging
- Follow existing Tailwind CSS patterns in the codebase
- Match hover/active states from current implementation
- Use existing color variables and spacing scales
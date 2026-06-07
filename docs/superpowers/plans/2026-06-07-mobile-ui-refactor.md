# Mobile UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the mobile UI on the home page by enlarging and redesigning the "Call Us 24x7" floating button and updating the mobile bottom navigation bar to show role-appropriate Dashboard links instead of a generic "Sign out" button for authenticated users.

**Architecture:** This plan modifies two existing components: the Call Us button in the home page (app/page.tsx) and the mobile bottom navigation in the Navbar component (components/Navbar.tsx). The changes are self-contained and follow existing styling patterns in the codebase.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide icons

---

### Task 1: Enlarge and Redesign Call Us Button

**Files:**
- Modify: `app/page.tsx:42-47`

- [ ] **Step 1: Identify current Call Us button code**

```tsx
<a
  href="tel:+919068902886"
  className="absolute -top-4 right-2 z-10 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-bold font-bold text-white shadow-lift transition hover:opacity-90 active:scale-200"
>
  Call Us<sup>24x7</sup> 
</a>
```

- [ ] **Step 2: Write modified Call Us button with increased size and improved text styling**

```tsx
<a
  href="tel:+919068902886"
  className="absolute -top-4 right-2 z-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-lg font-semibold text-white shadow-lift transition hover:opacity-90 active:scale-200"
>
  Call Us <span className="text-sm leading-none">24x7</span>
</a>
```

- [ ] **Step 3: Replace the Call Us button code in app/page.tsx**

```diff
- <a
-   href="tel:+919068902886"
-   className="absolute -top-4 right-2 z-10 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-bold font-bold text-white shadow-lift transition hover:opacity-90 active:scale-200"
- >
-   Call Us<sup>24x7</sup> 
- </a>
+ <a
+   href="tel:+919068902886"
+   className="absolute -top-4 right-2 z-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-lg font-semibold text-white shadow-lift transition hover:opacity-90 active:scale-200"
+ >
+   Call Us <span className="text-sm leading-none">24x7</span>
+ </a>
```

- [ ] **Step 4: Verify the changes by checking the file**

Run: `grep -A 8 "Call Us" app/page.tsx`
Expected: Should show the updated button with px-6 py-3, text-lg font-semibold, and span wrapper for 24x7

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: enlarge and redesign Call Us 24x7 button on mobile home page"
```

### Task 2: Update Mobile Bottom Navigation for Role-Based Dashboard Links

**Files:**
- Modify: `components/Navbar.tsx:162-169`

- [ ] **Step 1: Identify current mobile nav Sign out button code**

```tsx
<button
  onClick={signOut}
  className="flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition"
  aria-label="Sign out"
>
  <LogOut className="h-5 w-5" aria-hidden />
  <span className="mt-1">Sign out</span>
</button>
```

- [ ] **Step 2: Write role-based Dashboard link replacement**

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

- [ ] **Step 3: Replace the Sign out button code in components/Navbar.tsx**

```diff
- {!mounted ? null : user ? (
-   (role === "admin" || role === "owner") ? (
-     <Link
-       href={role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
-       className={cn(
-         "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
-         (pathname === "/owner/dashboard" || pathname === "/admin/dashboard") && "bg-ink text-white"
-       )}
-       aria-label="Account"
-     >
-       <UserRound className="h-5 w-5" aria-hidden />
-       <span className="mt-1">Account</span>
-     </Link>
-   ) : (
-     <button
-       onClick={signOut}
-       className="flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition"
-       aria-label="Sign out"
-     >
-       <LogOut className="h-5 w-5" aria-hidden />
-       <span className="mt-1">Sign out</span>
-     </button>
-   )
- ) : (
-   <Link
-     href="/login"
-     className={cn(
-       "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
-       pathname === "/login" && "bg-ink text-white"
-     )}
-     aria-label="Sign in"
-   >
-     <UserRound className="h-5 w-5" aria-hidden />
-     <span className="mt-1">Sign in</span>
-   </Link>
- )}
+ {!mounted ? null : user ? (
+   (role === "admin" || role === "owner") ? (
+     <Link
+       href={role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
+       className={cn(
+         "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
+         (pathname === "/owner/dashboard" || pathname === "/admin/dashboard") && "bg-ink text-white"
+       )}
+       aria-label="Account"
+     >
+       <UserRound className="h-5 w-5" aria-hidden />
+       <span className="mt-1">Account</span>
+     </Link>
+   ) : (
+     <Link
+       href={role === "student" ? "/student/dashboard" : "/"}
+       className={cn(
+         "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
+         pathname === "/student/dashboard" && "bg-ink text-white"
+       )}
+       aria-label="Dashboard"
+     >
+       <UserRound className="h-5 w-5" aria-hidden />
+       <span className="mt-1">Dashboard</span>
+     </Link>
+   )
+ ) : (
+   <Link
+     href="/login"
+     className={cn(
+       "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
+       pathname === "/login" && "bg-ink text-white"
+     )}
+     aria-label="Sign in"
+   >
+     <UserRound className="h-5 w-5" aria-hidden />
+     <span className="mt-1">Sign in</span>
+   </Link>
+ )}
```

- [ ] **Step 4: Verify the changes by checking the file**

Run: `grep -A 20 "!mounted ? null : user" components/Navbar.tsx`
Expected: Should show the updated conditional rendering with Dashboard links instead of Sign out button

- [ ] **Step 5: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: update mobile bottom nav to show role-based Dashboard links instead of Sign out"
```

## Summary

These two tasks complete the mobile UI refactor:
1. Call Us button is enlarged (px-6 py-3, text-lg font-semibold) with improved text styling
2. Mobile bottom navigation shows role-appropriate Dashboard links for authenticated users instead of Sign out button

## Verification Steps

After implementation, manually verify:
1. Call Us button appears larger on mobile devices
2. "24x7" text is properly aligned and readable
3. Authenticated students see Dashboard link routing to /student/dashboard
4. Authenticated owners see Account link routing to /owner/dashboard
5. Authenticated admins see Account link routing to /admin/dashboard
6. Unauthenticated users still see Sign in link
7. Desktop navbar functionality remains unchanged
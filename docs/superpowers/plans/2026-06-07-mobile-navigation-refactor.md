# Mobile Navigation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the mobile bottom navigation to use a unified link for all user roles and ensure mobile sidebar/drawer menus have sign out buttons matching desktop functionality.

**Architecture:** 
1. Simplify the ternary logic in Navbar.tsx mobile navigation to a single Link component with dynamic href based on user role
2. Verify existing mobile drawer implementations in StudentShell, OwnerShell, and AdminShell have sign out buttons
3. Ensure consistent styling and placement matching desktop sidebar sign out buttons

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide Icons, Clerk Authentication

---

### Task 1: Refactor Mobile Bottom Navigation in Navbar.tsx

**Files:**
- Modify: `/Users/namanlohchab/LivingGoWEBSITE/components/Navbar.tsx:150-176`

- [ ] **Step 1: Backup original file**
```bash
cp /Users/namanlohchab/LivingGoWEBSITE/components/Navbar.tsx /Users/namanlohchab/LivingGoWEBSITE/components/Navbar.tsx.backup
```

- [ ] **Step 2: Write the refactored mobile navigation code**
Replace the mobile navigation section (lines 150-176) with the unified implementation:
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

- [ ] **Step 3: Verify the changes work correctly**
- Check that admin users see "/admin/dashboard" href
- Check that owner users see "/owner/dashboard" href  
- Check that student users see "/student/dashboard" href
- Verify active state works when on any dashboard page
- Verify signed out state still shows sign in link

- [ ] **Step 4: Commit the changes**
```bash
git add /Users/namanlohchab/LivingGoWEBSITE/components/Navbar.tsx
git commit -m "feat: refactor mobile bottom navigation to unified dashboard link"
```

### Task 2: Verify Mobile Drawer Sign Out in StudentShell

**Files:**
- Verify: `/Users/namanlohchab/LivingGoWEBSITE/components/student/StudentShell.tsx`

- [ ] **Step 1: Check existing StudentSidebar implementation**
Verify that the StudentSidebar component already includes a sign out button at the bottom (it does, lines 100-103).

- [ ] **Step 2: Confirm mobile drawer implementation**
Check that the mobile drawer in StudentShell (lines 39-51) properly renders StudentSidebar with onSignOut prop.

- [ ] **Step 3: No changes needed**
Since the sign out button is already present and correctly styled, no modifications are required.

- [ ] **Step 4: Commit verification**
```bash
git add /Users/namanlohchab/LivingGoWEBSITE/components/student/StudentShell.tsx
git commit -m "chore: verify student shell mobile drawer has sign out button"
```

### Task 3: Add Mobile Drawer Sign Out to OwnerShell

**Files:**
- Modify: `/Users/namanlohchab/LivingGoWEBSITE/components/owner/OwnerShell.tsx`

- [ ] **Step 1: Check current OwnerShell implementation**
Review the current OwnerShell to see if it has mobile drawer implementation with sign out button.

- [ ] **Step 2: Add missing mobile drawer implementation**
Upon inspection, OwnerShell already has a complete mobile drawer implementation (lines 39-52) that includes OwnerSidebar with onSignOut prop, and OwnerSidebar already has a sign out button (lines 102-105).

- [ ] **Step 3: Verify styling matches desktop**
Confirm that the OwnerSidebar sign out button uses:
- Button variant="ghost"
- LogOut icon from lucide-react
- "Sign out" text
- Positioned at bottom with mt-auto (flex container)

- [ ] **Step 4: No changes needed**
OwnerShell already has the required mobile drawer with sign out button.

- [ ] **Step 5: Commit verification**
```bash
git add /Users/namanlohchab/LivingGoWEBSITE/components/owner/OwnerShell.tsx
git commit -m "chore: verify owner shell mobile drawer has sign out button"
```

### Task 4: Add Mobile Drawer Sign Out to AdminShell

**Files:**
- Modify: `/Users/namanlohchab/LivingGoWEBSITE/components/admin/AdminShell.tsx`

- [ ] **Step 1: Check current AdminShell implementation**
Review the current AdminShell to see if it has mobile drawer implementation with sign out button.

- [ ] **Step 2: Add missing mobile drawer implementation**
Upon inspection, AdminShell already has a complete mobile drawer implementation (lines 39-52) that includes AdminSidebar with onSignOut prop, and AdminSidebar already has a sign out button (lines 91-94).

- [ ] **Step 3: Verify styling matches desktop**
Confirm that the AdminSidebar sign out button uses:
- Button variant="ghost"
- LogOut icon from lucide-react
- "Sign out" text
- Positioned at bottom with mt-auto (flex container)
- Proper text-white/hover styling for admin theme

- [ ] **Step 4: No changes needed**
AdminShell already has the required mobile drawer with sign out button.

- [ ] **Step 5: Commit verification**
```bash
git add /Users/namanlohchab/LivingGoWEBSITE/components/admin/AdminShell.tsx
git commit -m "chore: verify admin shell mobile drawer has sign out button"
```

### Task 5: Test Implementation

**Files:**
- Test: Manual verification across all user roles

- [ ] **Step 1: Start development server**
```bash
npm run dev
```

- [ ] **Step 2: Test as signed out user**
- Verify mobile bottom navigation shows "Sign in" link
- Verify clicking sign in redirects to /login

- [ ] **Step 3: Test as student user**
- Verify mobile bottom navigation shows Dashboard link with href="/student/dashboard"
- Verify active state works when on /student/dashboard
- Open mobile drawer and verify sign out button is present at bottom
- Verify sign out button functions correctly

- [ ] **Step 4: Test as owner user**
- Verify mobile bottom navigation shows Dashboard link with href="/owner/dashboard"
- Verify active state works when on /owner/dashboard
- Open mobile drawer and verify sign out button is present at bottom
- Verify sign out button functions correctly

- [ ] **Step 5: Test as admin user**
- Verify mobile bottom navigation shows Dashboard link with href="/admin/dashboard"
- Verify active state works when on /admin/dashboard
- Open mobile drawer and verify sign out button is present at bottom
- Verify sign out button functions correctly

- [ ] **Step 6: Test responsive behavior**
- Verify desktop navigation still works correctly
- Verify mobile navigation appears only on mobile breakpoints
- Verify drawer opens/closes correctly on mobile

- [ ] **Step 7: Commit final testing**
```bash
git add .
git commit -m "feat: complete mobile navigation refactor and sign out button verification"
```
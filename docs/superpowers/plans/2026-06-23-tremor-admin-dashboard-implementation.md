# Tremor-Based Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current admin dashboard content with a Tremor library-based implementation featuring a responsive grid of metric cards and a data table for pending moderation items.

**Architecture:** 
- Maintain the existing AdminShell layout (sidebar, header) for consistency
- Replace only the main content area with Tremor components
- Use @tremor/react for Grid, Card, Metric, Table, and related components
- Extend existing useAdminStats hook to provide needed data (active listings, revenue)
- Create new hook or extend existing one for pending listings table data

**Tech Stack:**
- @tremor/react (Tremor library for React)
- TypeScript
- Next.js 15 (App Router)
- Existing AdminShell component
- Existing API hooks and types

## Global Constraints

- Must maintain existing AdminShell layout (sidebar, header, navigation)
- Must use exact @tremor/react component names: <Grid>, <Card>, <Text>, <Metric>, <Table>, <TableHead>, <TableRow>, <TableHeaderCell>, <TableBody>, <TableCell>
- Must preserve existing page title section ("Internal overview" and "Admin dashboard" heading)
- Must use responsive design (mobile-friendly grid layout)
- Must use existing useAdminStats hook where possible, extending it as needed
- Must follow existing codebase patterns (client components, TypeScript, etc.)
- Must not break existing admin navigation or sidebar functionality

---

### Task 1: Install @tremor/react Dependency

**Files:**
- Modify: `package.json`
- Create: (none)
- Test: (none)

**Interfaces:**
- Consumes: None
- Produces: @tremor/react package available for import

- [ ] **Step 1: Write the failing test**

This is a dependency installation task, so we'll verify by attempting to import the package.

```bash
# Verify package can be installed
npm list @tremor/react || echo "Package not installed"
```

Expected: FAIL with "package not found" or similar

- [ ] **Step 2: Install @tremor-react dependency**

```bash
npm install @tremor/react
```

Expected: Success message showing @tremor/react installed

- [ ] **Step 3: Verify installation**

```bash
npm list @tremor/react
```

Expected: Shows @tremor/react version in output

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @tremor/react dependency for admin dashboard"
```

---

### Task 2: Extend useAdminStats Hook for Additional Metrics

**Files:**
- Modify: `/hooks/useAdmin.ts`
- Create: (none)
- Test: (none)

**Interfaces:**
- Consumes: Existing getAdminStats API function
- Produces: Extended hook returning activeListings and revenue fields

- [ ] **Step 1: Examine current AdminStats type and API response**

First, let's understand what data we need to add. Check the API response structure.

```bash
# Examine the API function to understand current response
cat /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/admin.ts | grep -A 20 "getAdminStats"
```

- [ ] **Step 2: Update AdminStats type to include new fields**

```typescript
export type AdminStats = {
  totalUsers: number;
  totalProperties: number;
  pendingApprovals: number;
  approvedListings: number;
  pendingOwnerApprovals?: number;
  // NEW FIELDS FOR TREMOR DASHBOARD
  activeListings: number;
  revenue: number; // Assuming this is in some currency unit (e.g., cents or dollars)
};
```

- [ ] **Step 3: Update useAdminStats hook to fetch and set new fields**

```typescript
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((data) => {
        // Assuming API returns activeListings and revenue, otherwise we'll need to calculate or fetch separately
        setStats(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
```

- [ ] **Step 4: If API doesn't provide activeListings/revenue, create separate hooks or extend API**

For now, assuming we need to extend the API. If not, we'll create separate hooks.

```typescript
// If API needs extension, modify getAdminStats in lib/api/admin.ts
// Otherwise, create new hooks: useActiveListings and useRevenue
```

- [ ] **Step 5: Commit**

```bash
git add hooks/useAdmin.ts lib/api/admin.ts types/admin.ts
git commit -m "feat: extend useAdminStats hook with activeListings and revenue fields"
```

---

### Task 3: Create Hook for Pending Listings Table Data

**Files:**
- Modify: `/hooks/useAdmin.ts` (add new hook)
- Create: (none)
- Test: (none)

**Interfaces:**
- Consumes: Existing getAdminListings API function
- Produces: New hook returning pending listings data for table

- [ ] **Step 1: Create useAdminPendingListings hook**

```typescript
export function useAdminPendingListings() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    // Fetch only pending listings
    getAdminListings("") // Pass empty search or filter for pending
      .then((data) => {
        // Filter for pending status if API doesn't support filtering
        const pending = data.filter((listing) => listing.status === "pending");
        setListings(pending);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timeout);
  }, [refresh]);

  return { listings, isLoading, refresh };
}
```

- [ ] **Step 2: Alternative - modify existing useAdminListings to accept status filter**

Actually, let's check if getAdminListings supports filtering first:

```bash
# Check API function signature
grep -A 10 "export const getAdminListings" /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/admin.ts
```

- [ ] **Step 3: If API supports filtering, use that approach**

```typescript
export function useAdminPendingListings() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getAdminListings("", "pending") // Assuming second param is status filter
      .then(setListings)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timeout);
  }, [refresh]);

  return { listings, isLoading, refresh };
}
```

- [ ] **Step 4: Commit**

```bash
git add hooks/useAdmin.ts
git commit -m "feat: add useAdminPendingListings hook for table data"
```

---

### Task 4: Create Admin Dashboard Component with Tremor Implementation

**Files:**
- Modify: `/app/admin/dashboard/page.tsx`
- Create: (none)
- Test: (none)

**Interfaces:**
- Consumes: Extended useAdminStats hook, useAdminPendingListings hook
- Produces: Rendered admin dashboard with Tremor Grid and Table components

- [ ] **Step 1: Backup current dashboard component (for reference)**

```bash
cp /app/admin/dashboard/page.tsx /app/admin/dashboard/page.tsx.backup
```

- [ ] **Step 2: Write new dashboard component with Tremor implementation**

```typescript
"use client";

import { Building2, CheckCircle2, Clock3, Shield, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminStats } from "@/hooks/useAdmin";
import { useAdminPendingListings } from "@/hooks/useAdmin"; // Assuming we added it to same file
import { 
  Grid, 
  Card, 
  Text, 
  Metric, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell 
} from "@tremor/react";

export default function AdminDashboardPage() {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { listings, isLoading: listingsLoading } = useAdminPendingListings();

  // Handle loading states
  if (statsLoading || listingsLoading) {
    return (
      <AdminShell>
        <div className="mb-6">
          <p className="text-sm font-black uppercase text-clay">Internal overview</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Admin dashboard</h1>
        </div>
        
        {/* Loading state for metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
          ))}
        </div>
        
        {/* Loading state for table */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <h2 className="text-2xl font-black text-ink">Moderation Queue</h2>
          <div className="h-40 animate-pulse rounded-3xl bg-white" />
        </section>
      </AdminShell>
    );
  }

  // Extract stats values with fallbacks
  const totalUsers = stats?.totalUsers ?? 0;
  const activeListings = stats?.activeListings ?? 0;
  const revenue = stats?.revenue ?? 0;

  return (
    <AdminShell>
      {/* Page Title - KEEP EXISTING SECTION */}
      <section className="mb-6">
        <p className="text-sm font-black uppercase text-clay">Internal overview</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Admin dashboard</h1>
      </section>
      
      {/* Tremor Grid with Metric Cards */}
      <Grid className="gap-4 md:grid-cols-3">
        <Card>
          <Text variant="label" className="mb-2">Total Users</Text>
          <Metric>{totalUsers}</Metric>
        </Card>
        <Card>
          <Text variant="label" className="mb-2">Active Listings</Text>
          <Metric>{activeListings}</Metric>
        </Card>
        <Card>
          <Text variant="label" className="mb-2">Revenue</Text>
          <Metric>${(revenue / 100).toFixed(2)}</Metric> {/* Assuming revenue is in cents */}
        </Card>
      </Grid>
      
      {/* Tremor Data Table for Pending Moderation */}
      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="text-2xl font-black text-ink">Moderation Queue</h2>
        {listings.length === 0 ? (
          <p className="text-muted">No pending listings</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Property Title</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Submitted Date</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>{listing.id}</TableCell>
                  <TableCell>{listing.title}</TableCell>
                  <TableCell>{listing.ownerName}</TableCell>
                  <TableCell>
                    {/* Status badge */}
                    <span 
                      className={`px-2 py-1 text-xs rounded-full 
                        ${listing.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${listing.status === "approved" ? "bg-green-100 text-green-800" : ""}
                        ${listing.status === "rejected" ? "bg-red-100 text-red-800" : ""}`}
                    >
                      {listing.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Format date - assuming ISO string */}
                    <time dateTime={listing.submittedAt}>
                      {new Date(listing.submittedAt).toLocaleDateString()}
                    </time>
                  </TableCell>
                  <TableCell>
                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => /* approveListing(listing.id) */ }
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => /* rejectListing(listing.id) */ }
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 3: Run lint to check for any TypeScript errors**

```bash
npm run lint -- --fix
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "feat: implement Tremor-based admin dashboard with Grid and Table components"
```

---

### Task 5: Test Implementation and Adjust Styling

**Files:**
- Modify: `/app/admin/dashboard/page.tsx` (potential styling adjustments)
- Create: (none)
- Test: Manual verification in browser

**Interfaces:**
- Consumes: The implemented dashboard component
- Produces: Working admin dashboard with Tremor components

- [ ] **Step 1: Start development server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to admin dashboard and verify**

1. Login as admin (if auth required)
2. Visit `/admin/dashboard`
3. Verify:
   - Page loads without errors
   - Sidebar and header remain functional
   - Metric cards display correctly with data
   - Table displays pending listings with proper formatting
   - Responsive behavior works (resize browser)
   - Loading states appear when appropriate
   - No console errors

- [ ] **Step 3: Adjust any styling issues**

If needed, modify the component to fix:
- Metric card formatting
- Table column widths
- Date formatting
- Button styling
- Spacing and layout issues

- [ ] **Step 4: Commit any fixes**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "fix: adjust Tremor dashboard styling and responsiveness"
```

- [ ] **Step 5: Stop development server**

```bash
# Press Ctrl+C in the terminal where dev server is running
```

---

### Task 6: Final Review and Documentation Update

**Files:**
- Modify: (none)
- Create: (none)
- Test: (none)

**Interfaces:**
- Consumes: Completed implementation
- Produces: Verified working feature

- [ ] **Step 1: Review against original spec**

Check that implementation matches:
- [ ] Three metric cards: Total Users, Active Listings, Revenue
- [ ] Responsive grid layout
- [ ] Data table for pending moderation items
- [ ] Preserved AdminShell layout
- [ ] Existing page title maintained

- [ ] **Step 2: Update spec if needed based on implementation learnings**

If any changes were made during implementation that should be reflected in the spec:

```bash
# Update spec document with lessons learned
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Tremor-based admin dashboard implementation"
```

# Tremor-Based Admin Dashboard Design

**Date:** 2026-06-23  
**Project:** LivingGoWEBSITE  
**Component:** Admin Dashboard (/admin/dashboard)

## Overview
Replace the current admin dashboard content with a Tremor library-based implementation featuring a responsive grid of metric cards and a data table for pending moderation items.

## Design Details

### 1. Replacement Scope
- **Replaces:** Main content of `/admin/dashboard` page (inside `<main>` tag)
- **Preserves:** AdminShell layout (sidebar, header, overall structure)

### 2. Layout Structure
```
<main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">
  <!-- Page Title (KEEP THIS SECTION FROM CURRENT DASHBOARD) -->
  <section className="mb-6">
    <p className="text-sm font-black uppercase text-clay">Internal overview</p>
    <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Admin dashboard</h1>
  </section>
  
  <!-- Tremor Grid with Metric Cards -->
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
      <Metric>{revenue}</Metric>
    </Card>
  </Grid>
  
  <!-- Tremor Data Table for Pending Moderation -->
  <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
    <h2 className="text-2xl font-black text-ink">Moderation Queue</h2>
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
        <!-- Table rows will be populated with pending listings data -->
        <!-- Example structure:
        <TableRow key={listing.id}>
          <TableCell>{listing.id}</TableCell>
          <TableCell>{listing.title}</TableCell>
          <TableCell>{listing.ownerName}</TableCell>
          <TableCell>{listing.status}</TableCell>
          <TableCell>{listing.submittedDate}</TableCell>
          <TableCell>
            <!-- Action buttons (Approve, Reject) -->
          </TableCell>
        </TableRow>
        -->
      </TableBody>
    </Table>
  </section>
</main>
```

### 3. Components
#### Metric Cards (Tremor Grid)
- **Card 1:** Total Users
- **Card 2:** Active Listings  
- **Card 3:** Revenue
- Layout: Responsive grid (1 column on mobile, 3 columns on medium+ screens)

#### Data Table (Tremor Table)
- **Purpose:** Display pending moderation items (similar to current moderation queue)
- **Proposed Columns:**
  1. ID
  2. Property Title
  3. Owner
  4. Status
  5. Submitted Date
  6. Actions (approve/reject buttons)

### 4. Data Source
- **Primary:** Existing `useAdminStats` hook (located at `~/hooks/useAdmin.ts`)
- **Extensions Needed:**
  - Add `activeListings` and `revenue` fields to the hook's return type
  - Potentially create/add hook for pending listings data for the table
- **Alternative:** Extend existing hook to include all needed data

### 5. Styling & Responsiveness
- **Base:** Tremor's default styling system
- **Customization:** Can be customized via Tremor theme if needed
- **Responsiveness:** 
  - Metric cards stack vertically on small screens
  - Grid becomes 3-column on medium+ screens
  - Table scrolls horizontally on small screens if needed

### 6. Integration Points
- **File to modify:** `/app/admin/dashboard/page.tsx`
- **Hook to potentially extend:** `~/hooks/useAdmin.ts`
- **Components to install:** `@tremor/react` (via npm)

## Open Questions
1. Exact data shape needed from `useAdminStats` for active listings and revenue
2. Whether to create a separate hook for table data or extend `useAdminStats`
3. Specific actions to show in table's Actions column (approve, reject, view details)
4. Whether to apply custom Tremor theming to match LivingGo's brand colors

## Next Steps
1. Install `@tremor/react` dependency
2. Extend or create necessary data hooks
3. Implement the dashboard component using Tremor Grid and Table components
4. Test responsiveness and data accuracy
5. Consider adding loading states and error handling
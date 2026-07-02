# Coupon Management Component Design

## Date
2026-07-02

## Component Overview
Create a standalone `CouponManagement` component at `components/admin/CouponsManagement.tsx` (and link it via the App Router at `app/admin/coupons/page.tsx`) that provides a complete interface for managing coupons in the admin dashboard.

## Requirements
1. Display list of all coupons (active and inactive)
2. Toggle switch to activate/deactivate coupons
3. Form to create new coupons
4. Form to edit existing coupons
5. Button to delete coupons
6. Use mix of existing components and new Tailwind CSS components
7. Component must be wrapped cleanly inside the existing `<AdminShell>` layout wrapper to preserve layout constraints and safety filters.

## Component Architecture

### Main Component: CouponsManagement.tsx
- State management for coupons list, form states, loading states
- API integration with backend coupon endpoints via the global `apiClient` instance
- UI rendering with loading/error states

### Sub-components (if needed):
1. CouponTable - Displays list of coupons with actions
2. CouponForm - Handles both create and edit forms
3. CouponStatusToggle - Switch component for activating/deactivating
4. ConfirmationModal - For delete confirmation

## Data Flow

### Initial Load
1. Component mounts inside the `<AdminShell>` structure
2. Fetch coupons from `GET /api/admin/coupons`
3. Store in state
4. Render coupon table

### Creating a Coupon
1. User fills out form and clicks "Create"
2. Validate form data
3. Send POST request to `/api/admin/coupons`
4. On success: refresh coupon list, reset form
5. On error: show error message

### Editing a Coupon
1. User clicks edit on a coupon row
2. Populate form with coupon data
3. User makes changes and clicks "Update"
4. Validate form data
5. Send PUT request to `/api/admin/coupons/:id`
6. On success: update coupon in state, close form
7. On error: show error message

### Toggling Coupon Status
1. User clicks toggle switch on coupon row
2. Send PUT request to `/api/admin/coupons/:id` with updated isActive value
3. On success: update coupon status in state
4. On error: revert toggle and show error

### Deleting a Coupon
1. User clicks delete button on coupon row
2. Show confirmation modal
3. On confirm: send DELETE request to `/api/admin/coupons/:id`
4. On success: remove coupon from state
5. On error: show error message

## API Endpoints
*Must map accurately to the Express API admin routing schema:*
- GET `/api/admin/coupons` - Fetch all coupons
- POST `/api/admin/coupons` - Create new coupon
- GET `/api/admin/coupons/:id` - Get single coupon
- PUT `/api/admin/coupons/:id` - Update coupon
- DELETE `/api/admin/coupons/:id` - Delete coupon

## Data Structure
Coupon object from API (Strictly aligned with Prisma Schema specifications):
```typescript
{
  id: string;
  code: string;
  discountType: 'FLAT' | 'PERCENTAGE'; // Explicitly matched to Database Enum keys
  value: number;
  validFrom: Date;
  validTo: Date;
  targetPlans: string[];
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  affiliateId?: string;
  createdAt: Date;
  updatedAt: Date;
}
UI Components & Styling
Layout
Wrapped within <AdminShell>

Header section with title and "Add Coupon" button

Main content area with coupon table

Form modal/slide-over for create/edit operations

Confirmation modal for deletions

Styling Approach
Use existing components where possible (AdminStatCard, AdminStatusBadge, etc.)

Custom components built with Tailwind CSS

Responsive design for various screen sizes

Loading states using skeleton UI or spinner components

Error states with appropriate messaging

Reusable Components from Codebase
Button variants (primary, secondary, danger)

Input fields and form elements

Modal/Dialog components

Badge/status indicators

Spinner/Loader components

State Management
Local Component State
coupons: Coupon[] - list of all coupons

loading: boolean - overall loading state

creating: boolean - form submission state

editing: boolean - edit operation state

deleting: boolean - delete operation state

formData: Partial - current form values

editingId: string | null - ID of coupon being edited

error: string | null - error message for display

showForm: boolean - visibility of create/edit form

showDeleteConfirm: boolean - visibility of delete confirmation

Error Handling
API errors displayed in toast notifications or inline messages

Form validation errors shown near relevant fields

Loading states prevent duplicate submissions

Failed operations show retry options where appropriate

Accessibility Considerations
Proper ARIA labels for interactive elements

Keyboard navigable forms and modals

Sufficient color contrast for text and UI elements

Screen reader friendly error messages

Focus management for modals and form transitions

Performance Considerations
Debounce form validation where appropriate

Optimistic updates for toggle operations

Pagination or virtual scrolling for large coupon lists (future enhancement)

Memoization of expensive computations

Efficient re-rendering with React.memo where beneficial

Testing Considerations
Unit tests for component rendering and state changes

Mock API calls for testing data fetching and mutations

Test form validation logic

Test error handling scenarios

Dependencies
React hooks (useState, useEffect, useContext)

Existing API service (apiClient) or fetch utilities

Existing UI component library

Date handling utilities (for form validation)

Future Enhancements
Pagination for large coupon lists

Search and filter functionality

Bulk operations (activate/deactivate/delete multiple)

Export coupon data to CSV

Detailed usage statistics and analytics

Coupon usage history tracking

Implementation Notes
Follow existing code patterns in the codebase for consistency.

Use proper TypeScript interfaces for type safety.

Handle edge cases (empty states, loading states, error states).

Maintain consistent styling with the rest of the admin dashboard layout.

CRITICAL: Do NOT under any circumstances invoke or allow terminal execution blocks containing schema manipulation engines (npx prisma, migrate, db push, or database resets). Just create and compile the frontend React/TypeScript UI component structures.
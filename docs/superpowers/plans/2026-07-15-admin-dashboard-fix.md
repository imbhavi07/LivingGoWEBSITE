# Admin Dashboard Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical UX discrepancies and API route mismatches in the Admin Dashboard including image management issues, property editing failures, and improving the Admin Edit UI to match the premium design system.

**Architecture:** 
This plan follows a 4-phase approach: 
1. Align frontend API URLs with backend standards in `lib/api/admin.ts`
2. Implement missing backend routes and controllers in `backend/src/routes/admin.routes.ts` and `backend/src/controllers/admin.controller.ts`
3. Overhaul the Admin Edit UI to use the premium `AdminPropertyForm` component with proper props
4. Expose silent edit failures by improving error handling and validation feedback

**Tech Stack:** 
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma ORM
- State Management: React Context/Axios for API calls

## Global Constraints
- TypeScript strict mode enabled in both frontend and backend
- No use of 'any' types - proper type narrowing required
- Proper try/catch blocks in all backend controllers
- Run `npx tsc --noEmit` locally on both frontend and backend to guarantee zero type regressions
- Follow existing code conventions in the codebase

---

### Phase 1: Frontend URL Alignment

#### Task 1: Update API URLs in lib/api/admin.ts
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/admin.ts`

**Interfaces:**
- Consumes: None
- Produces: Updated API endpoint constants and functions

- [ ] **Step 1: Locate the target functions**
  Open `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/admin.ts` and locate:
  - `updateListing` function
  - `deletePropertyImage` function  
  - `replacePropertyImage` function
  - `addPropertyImages` function

- [ ] **Step 2: Update updateListing URL**
  Change the fetch URL in `updateListing` from current endpoint to `/api/admin/properties/:id`
  
  ```typescript
  // Before (example)
  // fetch(`/api/properties/${id}`, { method: 'PUT', ... })
  
  // After
  fetch(`/api/admin/properties/${id}`, { method: 'PUT', ... })
  ```

- [ ] **Step 3: Update deletePropertyImage URL**
  Change the fetch URL in `deletePropertyImage` to `/api/admin/properties/:id/images/:imageId`
  
  ```typescript
  // Before (example)
  // fetch(`/api/properties/${propertyId}/images/${imageId}`, { method: 'DELETE', ... })
  
  // After
  fetch(`/api/admin/properties/${propertyId}/images/${imageId}`, { method: 'DELETE', ... })
  ```

- [ ] **Step 4: Update replacePropertyImage URL**
  Change the fetch URL in `replacePropertyImage` to `/api/admin/properties/:id/images/:imageId`
  
  ```typescript
  // Before (example)
  // fetch(`/api/properties/${propertyId}/images/${imageId}`, { method: 'PUT', ... })
  
  // After
  fetch(`/api/admin/properties/${propertyId}/images/${imageId}`, { method: 'PUT', ... })
  ```

- [ ] **Step 5: Update addPropertyImages URL**
  Change the fetch URL in `addPropertyImages` to `/api/admin/properties/:id/images`
  
  ```typescript
  // Before (example)
  // fetch(`/api/properties/${propertyId}/images`, { method: 'POST', ... })
  
  // After
  fetch(`/api/admin/properties/${propertyId}/images`, { method: 'POST', ... })
  ```

- [ ] **Step 6: Verify type safety**
  Ensure all function parameters are properly typed and no 'any' types are used

- [ ] **Step 7: Commit changes**
  ```bash
  git add lib/api/admin.ts
  git commit -m "feat: align admin API URLs with backend standards"
  ```

### Phase 2: Backend Route Implementation

#### Task 2: Verify and add admin routes in admin.routes.ts
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/routes/admin.routes.ts`

**Interfaces:**
- Consumes: Controller functions from admin.controller.ts
- Produces: Express router with admin property/image routes

- [ ] **Step 1: Open admin.routes.ts**
  Examine the current routes to see if the required endpoints exist

- [ ] **Step 2: Check for admin auth middleware**
  Verify that routes are protected by admin authentication middleware

- [ ] **Step 3: Add missing routes if needed**
  Add the following routes above any catch-all routes:
  ```typescript
  router.put('/properties/:id', updatePropertyController);
  router.post('/properties/:id/images', addPropertyImagesController);
  router.put('/properties/:id/images/:imageId', replacePropertyImageController);
  router.delete('/properties/:id/images/:imageId', deletePropertyImageController);
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add backend/src/routes/admin.routes.ts
  git commit -m "feat: add missing admin property and image routes"
  ```

#### Task 3: Implement/admin controllers in admin.controller.ts
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/controllers/admin.controller.ts`

**Interfaces:**
- Consumes: Prisma client, request/response objects
- Produces: Controller functions with proper error handling and responses

- [ ] **Step 1: Open admin.controller.ts**
  Check if the required controller functions exist:
  - `updatePropertyController`
  - `addPropertyImagesController` 
  - `replacePropertyImageController`
  - `deletePropertyImageController`

- [ ] **Step 2: Implement missing controllers**
  For each missing controller, implement with:
  - Proper try/catch blocks
  - Prisma operations for property/image operations
  - Cloudinary storage logic for image operations
  - Standard 200/201 JSON success responses
  - Proper error responses with meaningful messages

  Example structure:
  ```typescript
  export const updatePropertyController = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validation and update logic here
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: updateData
      });
      
      res.status(200).json({ success: true, data: updatedProperty });
    } catch (error) {
      // Proper error handling with status codes
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'Property not found' });
        }
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  ```

- [ ] **Step 3: Ensure proper typing**
  Use proper TypeScript types, avoid 'any' types

- [ ] **Step 4: Commit changes**
  ```bash
  git add backend/src/controllers/admin.controller.ts
  git commit -m "feat: implement admin property and image controllers"
  ```

### Phase 3: Premium Edit UI Overhaul

#### Task 4: Update AdminPropertyForm to accept initialData prop
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/components/admin/AdminPropertyForm.tsx`

**Interfaces:**
- Consumes: initialData prop (optional)
- Produces: Form pre-filled with initialData when provided

- [ ] **Step 1: Open AdminPropertyForm.tsx**
  Examine the current component implementation

- [ ] **Step 2: Add initialData prop**
  Add optional initialData prop to the component interface:
  ```typescript
  interface AdminPropertyFormProps {
    onSubmit: (data: PropertyFormData) => Promise<void>;
    onCancel: () => void;
    initialData?: PropertyFormData; // Optional initial data for editing
  }
  ```

- [ ] **Step 3: Initialize form state with initialData**
  Modify the form initialization to use initialData when provided:
  ```typescript
  const initialFormData = initialData || {
    // default empty form values
    title: '',
    description: '',
    // ... other fields
  };
  
  const [formData, setFormData] = useState(initialFormData);
  ```

- [ ] **Step 4: Ensure form fields are populated**
  Make sure all form fields use the formData state for their values

- [ ] **Step 5: Commit changes**
  ```bash
  git add components/admin/AdminPropertyForm.tsx
  git commit -m "feat: add initialData prop to AdminPropertyForm for edit/create dual usage"
  ```

#### Task 5: Replace PropertyEditForm with AdminPropertyForm in admin listings page
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/app/admin/(dashboard)/listings/[id]/page.tsx`

**Interfaces:**
- Consumes: listing data, handleSave, handleCancel functions
- Produces: AdminPropertyForm with initialData prop

- [ ] **Step 1: Open the listings page file**
  Locate the `editing ? (...) : (...)` conditional block

- [ ] **Step 2: Replace PropertyEditForm**
  Remove the generic `<PropertyEditForm />` and replace with:
  ```typescript
  {editing ? (
    <AdminPropertyForm 
      initialData={listing}
      onSubmit={handleSave}
      onCancel={() => setEditing(false)}
    />
  ) : (
    // View mode content
  )}
  ```

- [ ] **Step 3: Ensure proper layout**
  Verify that the AdminPropertyForm maintains the full-width `grid lg:grid-cols-[1fr_380px]` layout

- [ ] **Step 4: Commit changes**
  ```bash
  git add app/admin/(dashboard)/listings/[id]/page.tsx
  git commit -m "feat: replace PropertyEditForm with AdminPropertyForm in admin edit view"
  ```

### Phase 4: Expose Silent Edit Failures

#### Task 6: Add validation error display to AdminPropertyForm
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/components/admin/AdminPropertyForm.tsx`

**Interfaces:**
- Consumes: Form validation state
- Produces: Validation error display above submit button

- [ ] **Step 1: Open AdminPropertyForm.tsx**
  Locate the form submission handler

- [ ] **Step 2: Add validation error state**
  Add state for validation errors:
  ```typescript
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  ```

- [ ] **Step 3: Validate before submission**
  In the submit handler, validate form data and set errors:
  ```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Perform validation (Zod or custom)
    const errors = validateFormData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return; // Early return if validation fails
    }
    
    // Clear validation errors on valid submission
    setValidationErrors([]);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Handle submission errors
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- [ ] **Step 4: Display validation errors**
  Add error display above submit button:
  ```typescript
  {validationErrors.length > 0 && (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p className="font-medium">Validation errors:</p>
      <ul className="mt-2 space-y-1 text-sm">
        {validationErrors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )}
  ```

- [ ] **Step 5: Commit changes**
  ```bash
  git add components/admin/AdminPropertyForm.tsx
  git commit -m "feat: add validation error display to AdminPropertyForm"
  ```

#### Task 7: Improve error handling in handleSave function
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/app/admin/(dashboard)/listings/[id]/page.tsx`

**Interfaces:**
- Consumes: Axios error response
- Produces: Proper error messaging via Toast context

- [ ] **Step 1: Open the listings page file**
  Locate the `handleSave` function

- [ ] **Step 2: Improve error handling**
  Update the try/catch block to properly handle Axios errors:
  ```typescript
  const handleSave = async (propertyData: PropertyFormData) => {
    setIsSaving(true);
    try {
      await api.admin.updateListing(listingId, propertyData);
      toast.success('Property updated successfully');
      setEditing(false);
      refetch(); // Refresh the property list
    } catch (error) {
      setIsSaving(false);
      if (axios.isAxiosError(error)) {
        // Extract specific error message from response
        const message = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Failed to update property';
        toast.error(message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSaving(false);
    }
  };
  ```

- [ ] **Step 3: Ensure proper Axios error checking**
  Import and use `axios.isAxiosError` for proper type narrowing:
  ```typescript
  import axios from 'axios';
  // ... in the catch block
  if (axios.isAxiosError(error)) {
    // Handle axios error
  }
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add app/admin/(dashboard)/listings/[id]/page.tsx
  git commit -m "feat: improve error handling in admin property edit handler"
  ```

#### Task 8: Add loading state to Submit button in AdminPropertyForm
**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/components/admin/AdminPropertyForm.tsx`

**Interfaces:**
- Consumes: isSubmitting state
- Produces: Submit button with loading state and disabled state

- [ ] **Step 1: Open AdminPropertyForm.tsx**
  Locate the submit button in the form

- [ ] **Step 2: Add loading state to button**
  Update the submit button to show loading state and disable when submitting:
  ```typescript
  <button
    type="submit"
    disabled={isSubmitting}
    className={`w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 ${isSubmitting ? 'cursor-not-allowed' : ''}`}
  >
    {isSubmitting ? 'Saving...' : 'Save Property'}
  </button>
  ```

- [ ] **Step 3: Ensure proper state management**
  Verify that `isSubmitting` state is properly managed in the form component

- [ ] **Step 4: Commit changes**
  ```bash
  git add components/admin/AdminPropertyForm.tsx
  git commit -m "feat: add loading state to AdminPropertyForm submit button"
  ```

### Type Checking and Final Validation

#### Task 9: Run TypeScript compilation check
**Files:**
- None (validation step)

**Interfaces:**
- Consumes: TypeScript configuration
- Produces: Compilation success/failure

- [ ] **Step 1: Run TypeScript check on frontend**
  ```bash
  cd /Users/bhavi/Downloads/LivingGoWEBSITE
  npx tsc --noEmit
  ```

- [ ] **Step 2: Run TypeScript check on backend**
  ```bash
  cd /Users/bhavi/Downloads/LivingGoWEBSITE/backend
  npx tsc --noEmit
  ```

- [ ] **Step 3: Commit any fixes if needed**
  ```bash
  git add .
  git commit -m "chore: fix TypeScript compilation errors"
  ```

#### Task 10: Final verification and documentation
**Files:**
- Create: `/Users/bhavi/Downloads/LivingGoWEBSITE/docs/superpowers/plans/2026-07-15-admin-dashboard-fix-summary.md`

**Interfaces:**
- Consumes: Completed implementation
- Produces: Summary documentation

- [ ] **Step 1: Verify all changes work**
  Start both frontend and backend dev servers and test:
  - Admin property editing works correctly
  - Image delete/replace/add operations work without 404s
  - Form validation shows errors properly
  - Submit button shows loading state
  - Error messages are displayed properly via toast

- [ ] **Step 2: Create summary document**
  ```markdown
  # Admin Dashboard Fix Summary
  
  ## Changes Made
  
  ### Phase 1: Frontend URL Alignment
  - Updated `updateListing`, `deletePropertyImage`, `replacePropertyImage`, and `addPropertyImages` functions in `lib/api/admin.ts` to use `/api/admin/properties/` endpoints
  
  ### Phase 2: Backend Route Implementation
  - Added missing routes in `backend/src/routes/admin.routes.ts`
  - Implemented controller functions in `backend/src/controllers/admin.controller.ts` with proper error handling and Prisma operations
  
  ### Phase 3: Premium Edit UI Overhaul
  - Added `initialData` prop to `AdminPropertyForm` component for dual create/edit usage
  - Replaced `PropertyEditForm` with `AdminPropertyForm` in admin listings edit page
  
  ### Phase 4: Expose Silent Edit Failures
  - Added validation error display to `AdminPropertyForm`
  - Improved error handling in `handleSave` function to show specific error messages
  - Added loading state to submit button in `AdminPropertyForm`
  
  ## Testing Performed
  - TypeScript compilation checks passed with no errors
  - Manual testing of admin property edit flow
  - Image management operations (delete, replace, add)
  - Error handling and validation testing
  
  ## Files Modified
  - `lib/api/admin.ts`
  - `backend/src/routes/admin.routes.ts`
  - `backend/src/controllers/admin.controller.ts`
  - `components/admin/AdminPropertyForm.tsx` (multiple updates)
  - `app/admin/(dashboard)/listings/[id]/page.tsx` (multiple updates)
  ```

- [ ] **Step 3: Commit summary**
  ```bash
  git add docs/superpowers/plans/2026-07-15-admin-dashboard-fix-summary.md
  git commit -m "docs: add summary of admin dashboard fixes"
  ```
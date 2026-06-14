# KYC Admin Panel Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Admin Panel KYC approval UI to display a single official document instead of "front and back" images, add PDF support, and improve backend Sandbox API data extraction.

**Architecture:** 
- Backend: Modify the `completeDigilockerSession` controller to extract Sandbox data more aggressively and set appropriate fallbacks
- Frontend: Update the admin approval details page to show a single document viewer with PDF support, remove back document UI, and update related types
- Types: Update TypeScript interfaces to reflect the single document model

**Tech Stack:** 
- Backend: Node.js, Express, TypeScript, Prisma
- Frontend: Next.js 13+, React, TypeScript, Tailwind CSS
- Database: PostgreSQL via Prisma

---

### Task 1: Backend Controller Update - Improve Sandbox Data Extraction

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/controllers/kyc.controller.ts:183-240`

- [ ] **Step 1: Add debug log after fetching document data**

```typescript
// 3. Fetch Document data
const documentResponse = await axios.get(`https://api.sandbox.co.in/kyc/digilocker/sessions/${sessionId}/documents/aadhaar`, {
  headers: {
    "Authorization": accessToken,
    "x-api-key": process.env.SANDBOX_API_KEY,
    "x-api-version": "1.0"
  }
});

const userProfileData = userProfileResponse.data;
const documentData = documentResponse.data;

// DEBUG: Log the exact Sandbox document payload structure
console.log("SANDBOX DOCUMENT PAYLOAD:", JSON.stringify(documentData.data, null, 2));
```

- [ ] **Step 2: Update phone mapping with aggressive fallback**

```typescript
await prisma.user.update({
  where: { email },
  data: {
    name: userProfileData.data.name,
    phone: userProfileData.data?.phone || userProfileData.data?.mobile || "Not provided by DigiLocker",
    ownerType: "PG Owner",
    // ... rest of the data
  }
});
```

- [ ] **Step 3: Update ID number mapping with aggressive fallback**

```typescript
await prisma.user.update({
  where: { email },
  data: {
    // ... previous fields
    aadhaarNumber: documentData.data?.parsed_data?.uid || documentData.data?.parsed_data?.id_number || "Not provided by DigiLocker",
    // ... rest of the data
  }
});
```

- [ ] **Step 4: Update document URL mapping and set back URL to null**

```typescript
await prisma.user.update({
  where: { email },
  data: {
    // ... previous fields
    aadhaarFrontUrl: documentData.data?.files?.[0]?.url || documentData.data?.url || null,
    aadhaarBackUrl: null, // Explicitly set to null as per requirements
    verificationStatus: "pending_approval",
    legalAcceptedAt: new Date()
  }
});
```

- [ ] **Step 5: Verify the changes work correctly**

Run: `cd backend && npm run lint`
Expected: No linting errors

- [ ] **Step 6: Commit backend changes**

```bash
git add backend/src/controllers/kyc.controller.ts
git commit -m "feat(backend): improve Sandbox data extraction in KYC controller with aggressive fallbacks and debug logging"
```

---

### Task 2: Frontend Types Update - Remove Back Document Reference

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/types/admin.ts:41-53`
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/types.ts:92-104`

- [ ] **Step 1: Update OwnerApproval type to remove aadhaarBackUrl**

```typescript
export type OwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  // aadhaarBackUrl: string;  // REMOVED
  legalAcceptedAt: string;
  verificationStatus: OwnerApprovalStatus;
  createdAt: string;
};
```

- [ ] **Step 2: Update ApiOwnerApproval type to remove aadhaarBackUrl**

```typescript
export type ApiOwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  // aadhaarBackUrl: string;  // REMOVED
  legalAcceptedAt: string;
  verificationStatus: OwnerApproval["verificationStatus"];
  createdAt: string;
};
```

- [ ] **Step 3: Update toOwnerApproval transformation function**

```typescript
export function toOwnerApproval(approval: ApiOwnerApproval): OwnerApproval {
  return {
    id: approval.id,
    name: approval.name,
    email: approval.email,
    phone: approval.phone,
    ownerType: approval.ownerType,
    aadhaarNumber: approval.aadhaarNumber,
    aadhaarFrontUrl: approval.aadhaarFrontUrl,
    // aadhaarBackUrl: approval.aadhaarBackUrl,  // REMOVED
    legalAcceptedAt: approval.legalAcceptedAt,
    verificationStatus: approval.verificationStatus,
    createdAt: approval.createdAt
  };
}
```

- [ ] **Step 4: Verify type changes compile correctly**

Run: `npm run type-check` (or check for TypeScript errors in IDE)
Expected: No TypeScript errors

- [ ] **Step 5: Commit type changes**

```bash
git add types/admin.ts lib/api/types.ts
git commit -m "feat(types): remove aadhaarBackUrl from OwnerApproval and ApiOwnerApproval types"
```

---

### Task 3: Frontend UI Update - Replace Image Viewer with PDF Support

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/app/admin/approvals/[id]/page.tsx:11-61`

- [ ] **Step 1: Remove DocumentCard import and update imports if needed**

```typescript
// Remove: import Image from "next/image";
// Keep other imports
```

- [ ] **Step 2: Update the UI grid layout to remove the back document column**

Change from:
```typescript
<div className="grid gap-6 xl:grid-cols-[1fr_360px]">
```
To:
```typescript
<div className="grid gap-6 xl:grid-cols-[1fr_300px]">
```
(Adjust width as needed since we removed one column)

- [ ] **Step 3: Remove the back document Info field**

Remove this line:
```typescript
<Info label="Aadhaar number" value={approval.aadhaarNumber} />
```

Actually, looking at the UI again, the Aadhaar number is separate from the document images. Let me re-examine the current UI...

Looking at the current code:
- Lines 36-43: Info grid (Email, Phone, Owner type, Aadhaar number, Legal accepted, Submitted)
- Lines 44-47: Document grid (Aadhaar front, Aadhaar back)

So I need to:
1. Keep the Aadhaar number in the Info grid (it's data, not an image)
2. Remove the entire document grid section for the back document
3. Update the front document section

- [ ] **Step 4: Update the Info grid to keep Aadhaar number (it's not being removed)**

The Info grid should remain as is since Aadhaar number is a text field, not an image.

- [ ] **Step 5: Replace the document grid with a single document viewer section**

Replace lines 44-47:
```typescript
<div className="mt-6 grid gap-4 md:grid-cols-2">
  <DocumentCard title="Aadhaar front" image={approval.aadhaarFrontUrl} />
  <DocumentCard title="Aadhaar back" image={approval.aadhaarBackUrl} />
</div>
```

With:
```typescript
<div className="mt-6">
  <DocumentViewer title="Official DigiLocker Document" url={approval.aadhaarFrontUrl} />
</div>
```

- [ ] **Step 6: Create the DocumentViewer component to handle PDFs and images**

Add this component before the closing brace of the file (after the DocumentCard function or at the end):

```typescript
function DocumentViewer({ title, url }: { title: string; url: string | null }) {
  if (!url) {
    return (
      <div className="overflow-hidden rounded-3xl bg-linen p-3">
        <p className="mb-3 text-sm font-black text-ink">{title}</p>
        <p className="text-sm text-center text-muted">No document available</p>
      </div>
    );
  }

  // Check if URL ends with .pdf to determine if it's a PDF
  const isPdf = url.toLowerCase().endsWith('.pdf');

  return (
    <div className="overflow-hidden rounded-3xl bg-linen p-3">
      <p className="mb-3 text-sm font-black text-ink">{title}</p>
      {isPdf ? (
        <>
          {/* PDF viewer using embed */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
            <embed 
              src={url} 
              type="application/pdf" 
              width="100%" 
              height="100%"
              className="object-contain"
            />
          </div>
          {/* Fallback link */}
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-2 block text-sm text-blue-500 underline"
          >
            Click to view document directly
          </a>
        </>
      ) : (
        {/* Standard image viewer for non-PDF files */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
          {/* Using next/image for optimization when it's an image */}
          <Image 
            src={url} 
            alt={title} 
            fill 
            className="object-cover" 
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Import next/Image at the top if not already imported**

Make sure we have:
```typescript
import Image from "next/image";
```

- [ ] **Step 8: Remove the DocumentCard function since we're replacing it**

Delete the DocumentCard function (lines 72-81 in the original file).

- [ ] **Step 9: Verify the UI changes work correctly**

Run: `npm run dev` and navigate to an admin approval page to verify:
- Single document viewer shows up
- PDFs display correctly in embed
- Images still display correctly
- Fallback link appears for PDFs
- No back document UI remains

- [ ] **Step 10: Commit frontend changes**

```bash
git add app/admin/approvals/[id]/page.tsx
git commit -m "feat(frontend): refactor KYC approval UI to show single document with PDF support and remove back document"
```

---

### Task 4: End-to-End Verification

**Files:**
- Test: Manual verification of the complete flow

- [ ] **Step 1: Start both frontend and backend development servers**

```bash
# In one terminal
cd backend && npm run dev

# In another terminal  
npm run dev
```

- [ ] **Step 2: Test the complete KYC flow with DigiLocker**

1. Initiate DigiLocker session from owner KYC page
2. Complete the DigiLocker authentication 
3. Verify that the backend correctly extracts and stores:
   - Phone number with proper fallbacks
   - ID number with proper fallbacks
   - Document URL with proper fallbacks
   - Back document URL set to null
4. Verify that the admin approval page shows:
   - Single document viewer titled "Official DigiLocker Document"
   - PDF documents display in embed viewer
   - Image documents display in image viewer
   - Fallback "Click to view document directly" link for PDFs
   - No back document section

- [ ] **Step 3: Test error cases and edge cases**

1. Test with missing Sandbox data to ensure fallbacks work
2. Test with null/empty document URLs
3. Test with various file types (PDF, JPG, PNG)

- [ ] **Step 4: Run linting and type checking to ensure no regressions**

```bash
npm run lint
npm run type-check  # or equivalent TypeScript check
```

- [ ] **Step 5: Commit final verification**

```bash
git add -u  # add any modified files from testing
git commit -m "chore: verify end-to-end KYC admin panel refactor works correctly"
```

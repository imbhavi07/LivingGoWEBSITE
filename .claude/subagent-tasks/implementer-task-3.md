You are implementing Task 3 from the KYC Admin Panel Refactor plan.

## Task 3: Frontend UI Update - Replace Image Viewer with PDF Support

**Files to Modify:**
- `/Users/bhavi/Downloads/LivingGoWEBSITE/app/admin/approvals/[id]/page.tsx:11-61`

**Steps to Implement:**

### Step 1: Remove DocumentCard import and update imports if needed
Check if Image from "next/image" is still needed (it will be for the PDF fallback)
Keep: `import Image from "next/image";`

### Step 2: Update the UI grid layout to remove the back document column
Change from:
```typescript
<div className="grid gap-6 xl:grid-cols-[1fr_360px]">
```
To:
```typescript
<div className="grid gap-6 xl:grid-cols-[1fr_300px]">
```
(Adjust width since we removed one column)

### Step 3: Remove the back document Info field
Actually, looking at the UI again, the Aadhaar number is separate from the document images. Looking at the current code:
- Lines 36-43: Info grid (Email, Phone, Owner type, Aadhaar number, Legal accepted, Submitted)
- Lines 44-47: Document grid (Aadhaar front, Aadhaar back)

So I need to:
1. Keep the Aadhaar number in the Info grid (it's data, not an image)
2. Remove the entire document grid section for the back document
3. Update the front document section

### Step 4: Update the Info grid to keep Aadhaar number (it's not being removed)
The Info grid should remain as is since Aadhaar number is a text field, not an image.

### Step 5: Replace the document grid with a single document viewer section
Replace lines 44-46 (based on current state after back removal):
```typescript
<div className="mt-6 grid gap-4">
  <DocumentCard title="Aadhaar front" image={approval.aadhaarFrontUrl} />
</div>
```

With:
```typescript
<div className="mt-6">
  <DocumentViewer title="Official DigiLocker Document" url={approval.aadhaarFrontUrl} />
</div>
```

### Step 6: Create the DocumentViewer component to handle PDFs and images
Add this component before the closing brace of the file (after the DocumentCard function):

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

### Step 7: Import next/Image at the top if not already imported
Make sure we have: `import Image from "next/image";`

### Step 8: Remove the DocumentCard function since we're replacing it
Delete the DocumentCard function (should be at the end of the file).

### Step 9: Verify the UI changes work correctly
Run: `npm run dev` and navigate to an admin approval page to verify:
- Single document viewer shows up
- PDFs display correctly in embed
- Images still display correctly
- Fallback link appears for PDFs
- No back document UI remains

### Step 10: Commit frontend changes
```bash
git add app/admin/approvals/[id]/page.tsx
git commit -m "feat(frontend): refactor KYC approval UI to show single document with PDF support and remove back document"
```
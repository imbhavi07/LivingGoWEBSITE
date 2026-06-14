You are implementing Task 1 from the KYC Admin Panel Refactor plan.

## Task 1: Backend Controller Update - Improve Sandbox Data Extraction

**Files to Modify:**
- `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/controllers/kyc.controller.ts:183-240`

**Steps to Implement:**

### Step 1: Add debug log after fetching document data
Add this debug log right after fetching the document data:
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

### Step 2: Update phone mapping with aggressive fallback
Change the phone mapping to:
```typescript
phone: userProfileData.data?.phone || userProfileData.data?.mobile || "Not provided by DigiLocker"
```

### Step 3: Update ID number mapping with aggressive fallback
Change the ID mapping to:
```typescript
aadhaarNumber: documentData.data?.parsed_data?.uid || documentData.data?.parsed_data?.id_number || "Not provided by DigiLocker"
```

### Step 4: Update document URL mapping and set back URL to null
Change the document URL mapping to:
```typescript
aadhaarFrontUrl: documentData.data?.files?.[0]?.url || documentData.data?.url || null
```
And explicitly set:
```typescript
aadhaarBackUrl: null
```

### Step 5: Verify the changes work correctly
Run: `cd backend && npm run lint`
Expected: No linting errors

### Step 6: Commit backend changes
```bash
git add backend/src/controllers/kyc.controller.ts
git commit -m "feat(backend): improve Sandbox data extraction in KYC controller with aggressive fallbacks and debug logging"
```

## Implementation Requirements:
- Follow TypeScript best practices
- Ensure the code is clean and readable
- Make sure all changes are within the specified file range
- Test that the lint passes after changes
- Create a meaningful commit message
You are implementing Task 2 from the KYC Admin Panel Refactor plan.

## Task 2: Frontend Types Update - Remove Back Document Reference

**Files to Modify:**
- `/Users/bhavi/Downloads/LivingGoWEBSITE/types/admin.ts:41-53`
- `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/types.ts:92-104`

**Steps to Implement:**

### Step 1: Update OwnerApproval type to remove aadhaarBackUrl
In `/Users/bhavi/Downloads/LivingGoWEBSITE/types/admin.ts`, change:
```typescript
export type OwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;  // REMOVE THIS LINE
  legalAcceptedAt: string;
  verificationStatus: OwnerApprovalStatus;
  createdAt: string;
};
```
To:
```typescript
export type OwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  legalAcceptedAt: string;
  verificationStatus: OwnerApprovalStatus;
  createdAt: string;
};
```

### Step 2: Update ApiOwnerApproval type to remove aadhaarBackUrl
In `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/types.ts`, change:
```typescript
export type ApiOwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;  // REMOVE THIS LINE
  legalAcceptedAt: string;
  verificationStatus: OwnerApproval["verificationStatus"];
  createdAt: string;
};
```
To:
```typescript
export type ApiOwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  legalAcceptedAt: string;
  verificationStatus: OwnerApproval["verificationStatus"];
  createdAt: string;
};
```

### Step 3: Update toOwnerApproval transformation function
In `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/types.ts`, update the toOwnerApproval function:
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
    // aadhaarBackUrl: approval.aadhaarBackUrl,  // REMOVE THIS LINE
    legalAcceptedAt: approval.legalAcceptedAt,
    verificationStatus: approval.verificationStatus,
    createdAt: approval.createdAt
  };
}
```
To:
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
    legalAcceptedAt: approval.legalAcceptedAt,
    verificationStatus: approval.verificationStatus,
    createdAt: approval.createdAt
  };
}
```

### Step 4: Verify type changes compile correctly
Run: `npm run type-check` (or check for TypeScript errors in IDE)
Expected: No TypeScript errors

### Step 5: Commit type changes
```bash
git add types/admin.ts lib/api/types.ts
git commit -m "feat(types): remove aadhaarBackUrl from OwnerApproval and ApiOwnerApproval types"
```
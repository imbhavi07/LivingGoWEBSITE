# Restore Owner Property API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore missing import and updateOwnerProperty function in lib/api/owner-properties.ts

**Architecture:** 
1. Import the OwnerPropertyPayload type from the types/owner module
2. Implement an async updateOwnerProperty function that takes property ID and FormData, makes authenticated PUT request to update property
3. Export the function for use in owner dashboard components

**Tech Stack:**
- TypeScript
- Axios (via apiClient)
- FormData for file uploads
- ES6 async/await

---

### Task 1: Import OwnerPropertyPayload Type

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts`

- [ ] **Step 1: Add import statement for OwnerPropertyPayload**

```typescript
import type { OwnerPropertyPayload } from "@/types/owner";
```

- [ ] **Step 2: Verify import works by checking for TypeScript errors**

Run: `npx tsc --noEmit /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts`
Expected: No TypeScript errors about OwnerPropertyPayload

- [ ] **Step 3: Commit**

```bash
git add /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts
git commit -m "feat: import OwnerPropertyPayload type in owner-properties api"
```

### Task 2: Implement updateOwnerProperty Function

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts`

- [ ] **Step 1: Write the updateOwnerProperty function at the end of the file**

```typescript
export async function updateOwnerProperty(id: string, data: FormData) {
  const { data: responseData } = await apiClient.put<ApiProperty>(`/owner/properties/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return toProperty(responseData);
}
```

- [ ] **Step 2: Verify the function compiles correctly**

Run: `npx tsc --noEmit /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts
git commit -m "feat: add updateOwnerProperty function to owner-properties api"
```

### Task 3: Final Verification

**Files:**
- Verify: `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts`

- [ ] **Step 1: Check complete file content**

```typescript
import type { OwnerPropertyPayload } from "@/types/owner";
import { apiClient } from "@/lib/api/client";
import { toProperty, type ApiProperty } from "@/lib/api/types";

function toPropertyFormData(payload: OwnerPropertyPayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  if (payload.priceSingle !== undefined) formData.append("priceSingle", String(payload.priceSingle));
  if (payload.bedsSingle !== undefined) formData.append("bedsSingle", String(payload.bedsSingle));
  if (payload.priceDouble !== undefined) formData.append("priceDouble", String(payload.priceDouble));
  if (payload.bedsDouble !== undefined) formData.append("bedsDouble", String(payload.bedsDouble));
  if (payload.priceTriple !== undefined) formData.append("priceTriple", String(payload.priceTriple));
  if (payload.bedsTriple !== undefined) formData.append("bedsTriple", String(payload.bedsTriple));
  if (payload.securityDepositMonths !== undefined) formData.append("securityDepositMonths", String(payload.securityDepositMonths));
  formData.append("location", payload.location);
  if (payload.lat !== undefined) formData.append("lat", String(payload.lat));
  if (payload.lng !== undefined) formData.append("lng", String(payload.lng));
  formData.append("roomType", payload.roomType);
  if (payload.sharedType !== undefined) formData.append("sharedType", payload.sharedType);
  formData.append("preference", payload.preference);
  if (payload.mealPlan !== undefined) formData.append("mealPlan", payload.mealPlan);
  formData.append("mealTimes", JSON.stringify(payload.mealTimes ?? []));
  if (payload.curfewTime !== undefined) formData.append("curfewTime", payload.curfewTime);
  if (payload.noticePeriod !== undefined) formData.append("noticePeriod", payload.noticePeriod);
  if (payload.rulesStrictness !== undefined) formData.append("rulesStrictness", payload.rulesStrictness);
  formData.append("facilities", JSON.stringify(payload.facilities));

  // NEW: Handle room-type mappings
  if (payload.roomTypeMappings) {
    formData.append("roomTypeMappings", JSON.stringify(payload.roomTypeMappings));
  }

  payload.imageFiles?.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}

export async function updateOwnerProperty(id: string, data: FormData) {
  const { data: responseData } = await apiClient.put<ApiProperty>(`/owner/properties/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return toProperty(responseData);
}
```

- [ ] **Step 2: Run TypeScript compilation to verify no errors**

Run: `npx tsc --noEmit /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts`
Expected: No TypeScript errors

- [ ] **Step 3: Final commit**

```bash
git add /Users/bhavi/Downloads/LivingGoWEBSITE/lib/api/owner-properties.ts
git commit -m "feat: restore missing code in owner-properties api - import and update function"
```
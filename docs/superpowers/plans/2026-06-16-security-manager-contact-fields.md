# Security Guard and Manager Contact Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional managerContact and securityContact string fields to the Property model across the full stack (database, types, validation, API, and frontend) to allow property owners to specify contact information for security personnel and property managers.

**Architecture:** Implement the changes in a layered approach starting with the database schema, then updating TypeScript types and validation schemas, followed by backend service adjustments, and finally adding the UI components in the property form. Each layer will maintain backward compatibility by making the fields optional.

**Tech Stack:** PostgreSQL (via Prisma ORM), TypeScript, Zod for validation, Next.js (React) for frontend, Express.js for backend.

---

### Task 1: Database Schema Update

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/prisma/schema.prisma:101-143`

- [ ] **Step 1: Add managerContact and securityContact fields to Property model**

```prisma
model Property {
  id                    String            @id @default(cuid())
  ownerId               String
  owner                 User              @relation("OwnerProperties", fields: [ownerId], references: [id], onDelete: Cascade)
  title                 String
  description           String
  price                 Int
  priceSingle           Int?
  bedsSingle            Int?
  priceDouble           Int?
  bedsDouble            Int?
  priceTriple           Int?
  bedsTriple            Int?
  occupiedBeds          Int               @default(0)
  securityDepositMonths String?
  location              String
  lat                   Float?
  lng                   Float?
  nearbyPlaces          Json?
  roomType              RoomType
  sharedType            String?
  preference            GenderPreference
  mealPlan              String?
  mealTimes             String[]
  curfewTime            String?
  noticePeriod          String?
  rulesStrictness       String?
  reviews               Review[]
  tenants               TenantResidence[]
  facilities            String[]
  status                PropertyStatus    @default(pending)
  images                PropertyImage[]
  wishlistedBy          Wishlist[]
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  tokenPayments         TokenPayment[]
  managerContact        String?           @db.VarChar(255)
  securityContact       String?           @db.VarChar(255)

  @@index([ownerId])
  @@index([status])
  @@index([location])
  @@index([price])
  @@index([createdAt])
}
```

- [ ] **Step 2: Run Prisma generate to update client**

Run: `cd backend && npx prisma generate`
Expected: Successfully generates Prisma client with new fields

- [ ] **Step 3: Commit database changes**

```bash
git add backend/prisma/schema.prisma
git commit -m "db: add managerContact and securityContact fields to Property model"
```

### Task 2: Types & Validation Updates

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/types/owner.ts:5-46`
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/lib/validation.ts:20-41`

- [ ] **Step 1: Add fields to OwnerProperty type**

```typescript
export type OwnerProperty = {
  occupiedBeds?: number;
  availableBeds?: number;
  rating?: number;
  reviewCount?: number;
  id: string;
  title: string;
  description: string;
  price: number;
  priceSingle?: number;
  bedsSingle?: number;
  priceDouble?: number;
  bedsDouble?: number;
  priceTriple?: number;
  bedsTriple?: number;
  securityDepositMonths?: string | number;
  location: string;
  lat?: number;
  lng?: number;
  roomType: RoomType;
  sharedType?: "Double" | "Triple" | "";
  preference: GenderPreference;
  mealPlan?: "Not Included" | "Veg Only" | "Veg + Non-Veg" | "Snacks Only";
  mealTimes?: string[];
  curfewTime?: "No Curfew" | "9 PM" | "10 PM" | "11 PM" | "12 AM";
  noticePeriod?: "15 Days" | "1 Month" | "2 Months";
  rulesStrictness?: "Strict" | "Lenient";
  facilities: string[];
  images: string[];
  status: OwnerListingStatus;
  createdAt: string;
  managerContact?: string;
  securityContact?: string;
};
```

- [ ] **Step 2: Add fields to OwnerPropertyPayload type**

```typescript
export type OwnerPropertyPayload = Omit<OwnerProperty, "id" | "status" | "createdAt" | "images"> & {
  images?: string[];
  isActive?: boolean;
  imageFiles?: File[];
  lat?: number;
  lng?: number;
  // NEW: For room-type-based photo uploading
  roomTypeMappings?: Array<{ index: number; roomType: string }>;
  managerContact?: string;
  securityContact?: string;
};
```

- [ ] **Step 3: Add fields to ownerPropertySchema validation**

```typescript
export const ownerPropertySchema = z.object({
  title: z.string().min(4, "Property title is too short"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(1000, "Enter a realistic monthly price"),
  priceSingle: z.coerce.number().min(0).optional(),
  bedsSingle: z.coerce.number().int().min(0).optional(),
  priceDouble: z.coerce.number().min(0).optional(),
  bedsDouble: z.coerce.number().int().min(0).optional(),
  priceTriple: z.coerce.number().min(0).optional(),
  bedsTriple: z.coerce.number().int().min(0).optional(),
  location: z.string().min(3, "Enter a valid location"),
  roomType: z.enum(["Single", "Shared"]),
  sharedType: z.enum(["Double", "Triple", ""]).optional(),
  preference: z.enum(["Boys", "Girls", "Any"]),
  mealPlan: z.enum(["Not Included", "Veg Only", "Veg + Non-Veg", "Snacks Only"]),
  mealTimes: z.array(z.string()).optional(),
  curfewTime: z.enum(["No Curfew", "9 PM", "10 PM", "11 PM", "12 AM"]),
  noticePeriod: z.enum(["15 Days", "1 Month", "2 Months"]),
  rulesStrictness: z.enum(["Strict", "Lenient"]),
  facilities: z.array(z.string()).min(1, "Select at least one facility"),
  images: z.array(z.string().min(1)).min(1, "Upload at least one image"),
  managerContact: z.string().optional(),
  securityContact: z.string().optional()
});
```

- [ ] **Step 4: Commit types and validation changes**

```bash
git add types/owner.ts lib/validation.ts
git commit -m "types: add managerContact and securityContact fields to owner types and validation"
```

### Task 3: Backend Service Update

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/services/property.service.ts:7-30` (PropertyInput type)
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/services/property.service.ts:55-105` (createProperty function)
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/backend/src/services/property.service.ts:144-173` (updateProperty function)

- [ ] **Step 1: Update PropertyInput type**

```typescript
type PropertyInput = {
  title: string;
  description: string;
  price: number;
  priceSingle?: number;
  bedsSingle?: number;
  priceDouble?: number;
  bedsDouble?: number;
  priceTriple?: number;
  bedsTriple?: number;
  securityDepositMonths?: string;
  location: string;
  lat?: number;
  lng?: number;
  roomType: RoomType;
  sharedType?: string;
  preference: GenderPreference;
  mealPlan?: string;
  mealTimes?: string[];
  curfewTime?: string;
  noticePeriod?: string;
  rulesStrictness?: string;
  facilities: string[];
  managerContact?: string;
  securityContact?: string;
};
```

- [ ] **Step 2: Update createProperty function to include new fields**

```typescript
export async function createProperty(ownerId: string, input: PropertyInput, images: ImageInput[]) {
  // Calculate nearby places if coordinates provided
  let nearbyPlaces = undefined;
  if (input.lat && input.lng) {
    try {
      nearbyPlaces = await findNearbyPlaces(
        input.lat,
        input.lng,
        input.preference === "Any" ? "Any" : input.preference,
        input.location
      );
    } catch (err) {
      console.error("Nearby places calculation failed:", err);
      // Don't fail property creation if nearby places fails
    }
  }

  return prisma.property.create({
    data: {
      ownerId,
      title: input.title,
      description: input.description,
      price: input.price,
      priceSingle: input.priceSingle,
      bedsSingle: input.bedsSingle,
      priceDouble: input.priceDouble,
      bedsDouble: input.bedsDouble,
      priceTriple: input.priceTriple,
      bedsTriple: input.bedsTriple,
      securityDepositMonths: input.securityDepositMonths,
      location: input.location,
      lat: input.lat,
      lng: input.lng,
      nearbyPlaces: nearbyPlaces ?? undefined,
      roomType: input.roomType,
      sharedType: input.sharedType,
      preference: input.preference,
      mealPlan: input.mealPlan,
      mealTimes: input.mealTimes ?? [],
      curfewTime: input.curfewTime,
      noticePeriod: input.noticePeriod,
      rulesStrictness: input.rulesStrictness,
      facilities: input.facilities,
      managerContact: input.managerContact,
      securityContact: input.securityContact,
      status: "pending",
      images: {
        create: images.map((image) => ({ url: image.url, publicId: image.publicId }))
      }
    },
    include: propertyInclude
  });
}
```

- [ ] **Step 3: Update updateProperty function to include new fields**

```typescript
export async function updateProperty(id: string, actorId: string, actorRole: Role, input: Partial<PropertyInput>) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
  if (actorRole !== "admin" && property.ownerId !== actorId) throw new AppError("Forbidden", 403);

  // Recalculate nearby places if coordinates changed
  let nearbyPlaces = undefined;
  if (input.lat && input.lng) {
    try {
      nearbyPlaces = await findNearbyPlaces(
        input.lat,
        input.lng,
        (input.preference ?? property.preference) === "Any" ? "Any" : (input.preference ?? property.preference),
        input.location ?? property.location
      );
    } catch (err) {
      console.error("Nearby places recalculation failed:", err);
    }
  }

  return prisma.property.update({
    where: { id },
    data: {
      ...input,
      ...(nearbyPlaces ? { nearbyPlaces } : {}),
      status: actorRole === "admin" ? property.status : "pending",
      managerContact: input.managerContact,
      securityContact: input.securityContact
    },
    include: propertyInclude
  });
}
```

- [ ] **Step 4: Commit backend service changes**

```bash
git add backend/src/services/property.service.ts
git commit -m "backend: add managerContact and securityContact fields to property service"
```

### Task 4: Frontend UI Updates

**Files:**
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/components/owner/OwnerPropertyForm.tsx:33-51` (state variables)
- Modify: `/Users/bhavi/Downloads/LivingGoWEBSITE/components/owner/OwnerPropertyForm.tsx:225-232` (after description textarea)

- [ ] **Step 1: Add state variables for managerContact and securityContact**

```typescript
export function OwnerPropertyForm({ property }: OwnerPropertyFormProps) {
  // ... existing code ...
  
  const [managerContact, setManagerContact] = useState(property?.managerContact ?? "");
  const [securityContact, setSecurityContact] = useState(property?.securityContact ?? "");
  
  // ... existing code ...
```

- [ ] **Step 2: Add form fields below description textarea**

```jsx
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Description</span>
              <textarea
                name="description"
                defaultValue={property?.description}
                className="input min-h-36 py-4"
                placeholder="Describe rooms, building, rules, meals, commute, and nearby colleges."
                required
              />
            </label>
            
            <label className="block space-y-2 mt-4">
              <span className="text-sm font-bold text-ink">Manager's Contact Number <span className="text-xs font-normal text-muted">(Optional)</span></span>
              <input 
                name="managerContact" 
                type="tel"
                value={managerContact}
                onChange={(e) => setManagerContact(e.target.value)}
                className="input" 
                placeholder="+91 9876543210" 
              />
            </label>
            
            <label className="block space-y-2 mt-4">
              <span className="text-sm font-bold text-ink">Security Guard Contact Number <span className="text-xs font-normal text-muted">(Optional)</span></span>
              <input 
                name="securityContact" 
                type="tel"
                value={securityContact}
                onChange={(e) => setSecurityContact(e.target.value)}
                className="input" 
                placeholder="+91 9876543210" 
              />
            </label>
```

- [ ] **Step 3: Update handleSubmit function to include new fields in form data parsing**

```typescript
    const parsed = ownerPropertySchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        price,
        priceSingle: formData.get("priceSingle") || undefined,
        bedsSingle: formData.get("bedsSingle") || undefined,
        priceDouble: formData.get("priceDouble") || undefined,
        bedsDouble: formData.get("bedsDouble") || undefined,
        priceTriple: formData.get("priceTriple") || undefined,
        bedsTriple: formData.get("bedsTriple") || undefined,
        location: pickedLocation.address,
        roomType,
        sharedType: hasDouble ? "Double" : hasTriple ? "Triple" : undefined,
        preference: formData.get("preference"),
        mealPlan: formData.get("mealPlan"),
        mealTimes: selectedMealTimes,
        curfewTime: formData.get("curfewTime"),
        noticePeriod: formData.get("noticePeriod"),
        rulesStrictness: formData.get("rulesStrictness"),
        securityDepositMonths: formData.get("securityDepositMonths") || undefined,
        facilities: selectedFacilities,
        images: allImageUrls,
        managerContact: formData.get("managerContact") || undefined,
        securityContact: formData.get("securityContact") || undefined
      });
```

- [ ] **Step 4: Commit frontend changes**

```bash
git add components/owner/OwnerPropertyForm.tsx
git commit -m "frontend: add managerContact and securityContact fields to owner property form"
```

### Task 5: Final Verification

**Files:**
- Verify all changes work together

- [ ] **Step 1: Run linting to ensure no TypeScript errors**

Run: `npm run lint` (in root directory)
Expected: No linting errors

- [ ] **Step 2: Test database migration (user will run this)**

Note: User needs to run `npx prisma migrate dev` after pulling changes

- [ ] **Step 3: Commit final verification**

```bash
git add .
git commit -m "chore: verify implementation of managerContact and securityContact fields"
```

## Self-Review

### 1. Spec coverage:
✓ Database schema updated with managerContact and securityContact fields
✓ TypeScript types updated in owner.ts
✓ Validation schema updated in lib/validation.ts
✓ Backend service updated to handle new fields
✓ Frontend UI added with state variables and form fields
✓ Form submission updated to include new fields

### 2. Placeholder scan:
No placeholders found - all steps contain actual implementation details.

### 3. Type consistency:
All property names match across files:
- managerContact (string) in Prisma, types, validation, service, and frontend
- securityContact (string) in Prisma, types, validation, service, and frontend

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-16-security-manager-contact-fields.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
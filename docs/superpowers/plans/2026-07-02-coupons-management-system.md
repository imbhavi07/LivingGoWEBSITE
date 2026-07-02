# Coupons Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete coupons management system with admin UI, backend APIs, database models, and customer-facing coupon validation for the LivingGo platform.

**Architecture:** The system will consist of:
1. Database layer: Prisma Coupon model with all required fields
2. Backend layer: Express.js routes and controllers for coupon management and validation
3. Frontend layer: Enhanced admin coupons UI and coupon application component in checkout flow
4. Security layer: Role-based access control restricting coupon management to specific admin emails

**Tech Stack:** TypeScript, Prisma ORM, Express.js, Next.js, React, Tailwind CSS

## Global Constraints
- Only users with email "semwalb3@gmail.com" OR "rctaccommodations@gmail.com" can access coupon management features
- Coupon code must be stored as uppercase and be unique
- Discount type must be either "FIXED" or "PERCENTAGE" 
- Value must be a positive integer
- validFrom must be before validTo
- Target plans stored as String array
- Affiliate ID stored as optional String for tracking
- All API endpoints must validate user permissions
- Frontend must use existing UI components and styling patterns

---

### Task 1: Create Coupon Prisma Model and Migration

**Files:**
- Create: `backend/prisma/schema.prisma` (modify)
- Create: `backend/prisma/migrations/20260702000001_create_coupon/migration.sql` (create)

**Interfaces:**
- Produces: Prisma Coupon model with fields: code, discountType, value, validFrom, validTo, targetPlans, isActive, maxUses, currentUses, affiliateId

- [ ] **Step 1: Add Coupon model to Prisma schema**

```prisma
model Coupon {
  id            String   @id @default(cuid())
  code          String   @unique
  discountType  DiscountType
  value         Int
  validFrom     DateTime
  validTo       DateTime
  targetPlans   String[]
  isActive      Boolean  @default(true)
  maxUses       Int?
  currentUses   Int      @default(0)
  affiliateId   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([code])
  @@index([affiliateId])
}

enum DiscountType {
  FIXED
  PERCENTAGE
}
```

- [ ] **Step 2: Create migration file**

```sql
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "targetPlans" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "affiliateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_affiliateId_idx" ON "Coupon"("affiliateId");
```

- [ ] **Step 3: Apply migration**

Run: `cd backend && npx prisma migrate dev --name create-coupon`
Expected: Migration applied successfully

- [ ] **Step 4: Generate Prisma client**

Run: `cd backend && npx prisma generate`
Expected: Prisma client generated successfully

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add Coupon model and migration"
```

### Task 2: Create Coupon Service Layer

**Files:**
- Create: `backend/src/services/coupon.service.ts` (create)

**Interfaces:**
- Consumes: Prisma Coupon model
- Produces: CouponService class with methods: createCoupon, getCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon, applyCoupon

- [ ] **Step 1: Create coupon service file**

```typescript
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/app-error';

const prisma = new PrismaClient();

export class CouponService {
  async createCoupon(data: {
    code: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    value: number;
    validFrom: Date;
    validTo: Date;
    targetPlans: string[];
    isActive?: boolean;
    maxUses?: number;
    affiliateId?: string;
  }) {
    // Validate input
    if (!data.code || data.code.trim() === '') {
      throw new AppError('Coupon code is required', 400);
    }
    
    if (data.value <= 0) {
      throw new AppError('Coupon value must be greater than 0', 400);
    }
    
    if (data.validFrom >= data.validTo) {
      throw new AppError('validFrom must be before validTo', 400);
    }
    
    // Convert code to uppercase
    const upperCaseCode = data.code.toUpperCase().trim();
    
    // Check if coupon already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: upperCaseCode }
    });
    
    if (existingCoupon) {
      throw new AppError('Coupon code already exists', 409);
    // ... (truncated
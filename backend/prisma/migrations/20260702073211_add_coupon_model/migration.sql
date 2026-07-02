-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managerContact" VARCHAR(255),
ADD COLUMN     "securityContact" VARCHAR(255);

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "roomCategory" TEXT;

-- AlterTable
ALTER TABLE "TokenPayment" ADD COLUMN     "moveInRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentSettled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedRoomType" "RoomType",
ADD COLUMN     "visitOtp" TEXT,
ADD COLUMN     "visitVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PropertyPanorama" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "roomCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPanorama_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "PropertyPanorama_propertyId_idx" ON "PropertyPanorama"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_affiliateId_idx" ON "Coupon"("affiliateId");

-- AddForeignKey
ALTER TABLE "PropertyPanorama" ADD CONSTRAINT "PropertyPanorama_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

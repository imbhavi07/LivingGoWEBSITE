-- CreateEnum
CREATE TYPE "TokenPaymentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "TokenPayment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "utrNumber" TEXT NOT NULL,
    "status" "TokenPaymentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TokenPayment_studentId_idx" ON "TokenPayment"("studentId");

-- CreateIndex
CREATE INDEX "TokenPayment_propertyId_idx" ON "TokenPayment"("propertyId");

-- CreateIndex
CREATE INDEX "TokenPayment_status_idx" ON "TokenPayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TokenPayment_studentId_propertyId_key" ON "TokenPayment"("studentId", "propertyId");

-- AddForeignKey
ALTER TABLE "TokenPayment" ADD CONSTRAINT "TokenPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPayment" ADD CONSTRAINT "TokenPayment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

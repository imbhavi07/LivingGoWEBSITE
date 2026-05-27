CREATE TYPE "VerificationStatus" AS ENUM ('not_required', 'pending_email_verification', 'pending_approval', 'approved', 'rejected');

ALTER TABLE "User"
ADD COLUMN "ownerType" TEXT,
ADD COLUMN "aadhaarNumber" TEXT,
ADD COLUMN "aadhaarFrontUrl" TEXT,
ADD COLUMN "aadhaarBackUrl" TEXT,
ADD COLUMN "legalAcceptedAt" TIMESTAMP(3),
ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'not_required',
ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "User_verificationStatus_idx" ON "User"("verificationStatus");

CREATE TABLE "EmailOtp" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailOtp_email_purpose_createdAt_idx" ON "EmailOtp"("email", "purpose", "createdAt");
CREATE INDEX "EmailOtp_expiresAt_idx" ON "EmailOtp"("expiresAt");

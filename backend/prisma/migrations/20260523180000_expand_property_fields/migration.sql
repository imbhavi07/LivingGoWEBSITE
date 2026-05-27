ALTER TABLE "Property"
ADD COLUMN "priceSingle" INTEGER,
ADD COLUMN "bedsSingle" INTEGER,
ADD COLUMN "priceDouble" INTEGER,
ADD COLUMN "bedsDouble" INTEGER,
ADD COLUMN "priceTriple" INTEGER,
ADD COLUMN "bedsTriple" INTEGER,
ADD COLUMN "securityDepositMonths" TEXT,
ADD COLUMN "sharedType" TEXT,
ADD COLUMN "mealPlan" TEXT,
ADD COLUMN "mealTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "curfewTime" TEXT,
ADD COLUMN "noticePeriod" TEXT,
ADD COLUMN "rulesStrictness" TEXT;

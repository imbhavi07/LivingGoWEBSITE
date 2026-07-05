# Referral & Earn System Redesign Design Document

## Overview
This document outlines the redesign of the "Refer & Earn" and "Token Payment" flow to make referrals 100% public (no login required) and implement UTR-based payment verification.

## Key Changes

### 1. Public EARN Page (`app/earn/page.tsx`)
**Current Behavior**: Requires login to generate referral codes  
**New Behavior**: Publicly accessible with two sections:
- **Generate Your Code**: Form for public users to create referral codes
- **Track Earnings**: Public lookup of referral code usage statistics

#### Generate Form Fields:
- Name (As per PAN/Aadhaar/Bank) - Required
- College (Optional) 
- UPI ID - Required
- Desired Code Prefix - Required (letters only, auto-appends '500')

#### Tracking Section:
- Input field to search referral code
- Displays public ledger showing: Date, Referrer Name, Amount (₹500), Status

### 2. Public Earn API Route (`app/api/earn/public/route.ts`)
**New Endpoint**: POST `/api/earn/public`

**Process**:
1. Validate input (name, college optional, UPI ID, prefix - letters only)
2. Generate referral code: prefix.toUpperCase() + "500" (e.g., "RAHUL500")
3. Create silent/ghost user:
   - Email: `${prefix.toLowerCase()}@livinggopartner.in`
   - Role: 'CREATOR'
   - Name: Provided name
   - Other fields: default/null values
4. Create Referral record:
   - userId: ghost user ID
   - code: generated referral code
   - status: 'APPROVED' (instant approval)
   - upiId: provided UPI ID
   - invites: 0
   - successful: 0
   - earnings: 0

### 3. Lock Modal Discount Logic Update
**Location**: Components handling room booking/token payment (likely in property booking flow)

**Updated Logic**:
1. When referral/coupon code is applied:
   - First check `prisma.referral` for code ending in '500'
   - If found and status is 'APPROVED': Apply flat ₹500 discount
   - If not found in referrals: Check `prisma.coupon` for admin-generated codes
   - Apply coupon discount based on its type (FLAT/PERCENTAGE) and value

### 4. UTR Payment Confirmation Form Update
**Location**: Payment step in property booking flow (after QR code display)

**Changes**:
- Remove image upload fields
- Add strict form with validation:
  - Payee Name (As per bank account) - Required
  - Payee UPI ID - Required (valid UPI format)
  - Payee Phone Number - Required (10-digit Indian mobile)
  - 12-digit UTR/Transaction ID - Required (exactly 12 digits)

**Model Updates** (if needed in `schema.prisma`):
Add to `TokenPayment` model:
- `payeeName` String?
- `payeeUpi` String?
- `payeePhone` String?
- Ensure `utrNumber` exists (currently present)

### 5. Database Schema Considerations
**Referral Model** (already exists in schema.prisma):
- Already has: userId, code, status, invites, successful, earnings, upiId
- Need to ensure status can be set to 'APPROVED' for public referrals

**TokenPayment Model** (already exists):
- Currently has: utrNumber field
- May need to add: payeeName, payeeUpi, payeePhone fields if not present

### 6. Security Considerations
- Public referral generation creates ghost users with minimal data
- Referral codes are unique and follow strict format (letters + 500)
- UTR validation prevents fraudulent payment claims
- Ghost users have limited privileges (CREATOR role) and cannot access protected routes

### 7. User Experience Flow
**Referral Generation**:
1. User visits `/earn` page
2. Fills out form with name, college (optional), UPI ID, prefix
3. System validates prefix (letters only)
4. System generates code: prefix + "500"
5. System creates ghost user and referral record instantly
6. User sees their referral code and sharing instructions

**Referral Tracking**:
1. User visits `/earn` page
2. Enters a referral code in the tracking section
3. System returns public ledger showing all uses of that code
4. Each entry shows: date, referrer name, ₹500 amount, status

**Payment with Referral**:
1. User proceeds to book a property
2. At payment step, enters referral code
3. System validates code exists in referrals and ends with "500"
4. Applies flat ₹500 discount
5. User completes payment via UPI
6. User enters UTR details (payee name, UPI, phone, 12-digit UTR)
7. System saves payment details to TokenPayment record

## Success Metrics
- Increase in referral code generation (removing login barrier)
- Accurate tracking of referral usage and earnings
- Reduced payment fraud through UTR verification
- Seamless discount application for valid referrals
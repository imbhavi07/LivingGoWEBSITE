---
name: refactored-owner-kyc-page
description: Refactored Owner KYC page to use Aadhaar OTP flow instead of DigiLocker
metadata:
  type: project
---

Updated app/owner/kyc/page.tsx to replace the DigiLocker redirect with a Sandbox two-step Aadhaar OTP flow. The implementation includes:

1. Added state variables for aadhaarNumber, otp, referenceId, kycStep (default 1), isLoading, and errorMessage
2. Implemented handleSendOtp function to validate Aadhaar number and send OTP via API
3. Implemented handleVerifyOtp function to verify OTP using referenceId and user email from Clerk
4. Updated UI to conditionally render based on kycStep:
   - Step 1: Aadhaar number input + Send OTP button
   - Step 2: OTP input + Verify OTP button + Change Aadhaar Number button
   - Step 3: Success message + Go to Dashboard button
5. Preserved existing top-level form fields (Name, Phone, Owner Type) as requested
6. Updated descriptive text to reflect Aadhaar OTP verification instead of DigiLocker

The refactor maintains all existing functionality while switching the verification mechanism from DigiLocker redirect to a two-step OTP flow.
**Why:** The requirement was to replace DigiLocker with Sandbox two-step Aadhaar OTP flow while preserving existing form fields.
**How to apply:** This pattern can be extended for other verification flows by modifying the API endpoints and state handling.
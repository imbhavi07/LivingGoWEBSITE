# LIVINGGO - MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD) & ARCHITECTURE
> **SYSTEM INSTRUCTION FOR AI AGENTS (CLAUDE CODE):** > Treat this document as the absolute source of truth for the LivingGo project. It contains the business logic, UI/UX architecture, financial routing rules, and the strict anti-circumvention system. Before writing any code, cross-reference your proposed solution against the constraints in this document.

## 1. PROJECT OVERVIEW & TECH STACK
LivingGo is a PropTech marketplace designed for the Indian student accommodation (PG/Flat) market, currently targeting Delhi University students. The platform's primary goal is to match students with verified properties while mathematically preventing lead leakage/circumvention through masked data and automated financial routing.

**Core Tech Stack:**
* **Frontend:** Next.js (App Router), React, TypeScript (TSX).
* **Styling:** Tailwind CSS (with `tailwindcss-animate` for dynamic UI states).
* **Backend:** Node.js (running locally on port 5000, preparing for cloud deployment).
* **Database:** Neon (Serverless PostgreSQL).
* **State / Forms:** `react-hook-form` and `zod` schema validation.
* **Payments:** Razorpay / Cashfree (SmartCollect, Route/Split, Webhooks).

---

## 2. DATABASE ARCHITECTURE (NEON POSTGRES)
The database must follow strict normalization and Role-Based Access Control (RBAC).

* **Users Table:** Single table architecture for all users. Differentiated by a `role` column (`role: 'student' | 'owner' | 'admin'`).
* **Properties Table:** Must store explicit inventory and pricing splits. 
    * Fields include: `priceSingle`, `bedsSingle`, `priceDouble`, `bedsDouble`, `priceTriple`, `bedsTriple`, `securityDepositMonths`.
    * Address masking: Must split `exact_address` (hidden) from `public_landmark` (visible).
* **Wallet / Ledger Table:** Atomic ledger to track "LivingGo Credits" (booking tokens), rent payments, and payouts.
* **Matches / Bookings Table:** Tracks the state of a lead (`has_paid_token`, `visit_verified`, `rent_settled`).

---

## 3. CORE BUSINESS LOGIC: THE ANTI-BYPASS SYSTEM
*This is the platform's protective moat. These rules must be enforced at the API level, NOT just hidden with CSS.*

* **Contact Masking (API Bouncer):** The backend must strip `exact_address` and `owner_phone` from the JSON response for any user with `role: 'student'` UNLESS `has_paid_token` is `true` for that specific property ID. Tech-savvy students inspecting network payloads must only see masked data.
* **Google Maps Distance Sync:** The API utilizes Google Geocoding/Haversine formula to show the student the exact distance to nearest landmarks (e.g., "200m from Hansraj College") without revealing the PG name.
* **Interior-Only Media Rule:** Owners are warned via UI and terms that exterior photos are forbidden to prevent students from identifying the building visually.
* **OTP Visit Verification:** When a student visits, they provide a 4-digit OTP to the owner. The owner inputs this into the dashboard to mathematically lock the visit timeline, creating legal evidence of the lead origin.
* **Mandatory Digital Acceptance:** The `OwnerPropertyForm` must include mandatory checkboxes for "Platform Listing Agreement" and "Non-Circumvention Policy". The form cannot submit unless checked.

---

## 4. FINANCIAL ARCHITECTURE & ZERO MDR PAYMENTS
LivingGo avoids standard 2% credit card gateway fees by relying on India's Zero MDR UPI mandate and API-driven Nodal routing.

**A. The Booking Token (Brokerage & Lead Lock)**
* **Amount:** Dynamically set to exactly 50% of the first month's rent (e.g., ₹14k rent = ₹7k token).
* **Rules:** Non-refundable, but acts as transferable "LivingGo Credit". If the student dislikes Property A, the credit remains in their ledger to use for Property B.
* **Gateway Rule:** The payment intent payload MUST strictly enforce `['upi']` only (dynamic QR/intent). Credit cards must be disabled for this step to ensure Zero MDR.
* **Webhook Action:** Upon webhook success confirmation, the backend instantly updates the ledger, flags `has_paid_token: true`, and the UI instantly drops the contact mask. (Must implement idempotency to prevent double-crediting).

**B. The Rent Settlement & Virtual Accounts**
* **Collection:** Handled via SmartCollect/Auto Collect. Students are assigned a unique Virtual Bank Account (NEFT/RTGS) to pay the remaining Move-In Cost (Remaining 50% Rent + Security Deposit).
* **Route / Vendor Split:** Using Razorpay Route, the backend commands the Escrow/Nodal account to automatically split the incoming funds. The owner receives their exact cut minus LivingGo's already-captured token fee.

**C. Tiered Monthly Owner Billing (Platform Fee)**
Owners are automatically billed a monthly management fee based on active platform-sourced tenants:
* < 10 students: ₹500 / month / student
* 10 - 20 students: ₹1,000 / month / student
* 20+ students: ₹1,500 / month / student

---

## 5. FRONTEND UI/UX SPECS (NEXT.JS)

### The Owner Workspace (4 Main Tabs)
1.  **Dashboard (The Hook):** Command center showing Occupancy %, Monthly Revenue, Pending Rent, and Active Leads. Students who paid the token must have a "Protected Lead" or "Platform Tagged" UI badge. Must include a Visit Verification OTP input.
2.  **Properties & Tenants:** Drill-down view of listings. Tenant list with color-coded tags (Green: Paid, Red: Overdue).
3.  **Income (Virtual Wallet):** Visual wallet showing total rent/bills collected, ledger history, and a withdrawal gateway link.
4.  **Add Property Form (`OwnerPropertyForm.tsx`):**
    * Built using `react-hook-form` and `zod`.
    * **Dynamic Inventory:** Uses boolean toggles (`hasSingle`, `hasDouble`, `hasDeposit`) combined with Tailwind's `animate-in fade-in` to dynamically reveal pricing and bed-count inputs.
    * **Interior Media Warning:** Explicit banner on the image upload zone.
    * **Legal Lock-In:** Checkboxes for agreements before the "Create Property" button.

### Student Onboarding
* Concise, mobile-first questionnaire (max 10 questions) capturing roommate compatibility vectors (sleep schedule, dietary habits, regional background, study habits).
* Data maps to a `StudentPreferences` Zod schema to fuel the backend matching algorithm.

---

## 6. CLAUDE CODE EXECUTION INSTRUCTIONS
When analyzing the codebase against this PRD:
1.  Start by doing a gap analysis between the existing `/app`, `/components`, and `/backend` directories vs. this document.
2.  Identify missing types (e.g., ensuring `OwnerProperty` interfaces match the dynamic inventory fields).
3.  Do not attempt to implement standard credit card checkouts. Rely strictly on UPI intents and webhook listeners as outlined in Section 4.
4.  Always ensure API routes interacting with the database properly strip PII (Personally Identifiable Information) based on the user's token state.

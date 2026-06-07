Create a visual development progress dashboard for the LivingGo project using React, Tailwind CSS, and Recharts. The dashboard should display:

## Overall Project Status
- Overall Completion: 35% (show as a circular progress bar or gauge)
- Status Indicator: "In Progress - Anti-bypass system critical"

## Progress by Category (Use Bar Charts or Horizontal Progress Bars)

### FRONTEND PROGRESS
- Core Infrastructure: 85%
- Authentication: 80%
- UI Component Library: 60%
- Property Discovery: 70%
- Property Detail View: 50%
- Wishlist: 60%
- Student Onboarding: 30%
- Student Dashboard: 20%
- Booking Flow: 10%
- Payments: 0%
- Complaint System: 0%
- Food Menu/Notices: 0%
- Digital Agreements: 0%
- Owner Dashboard: 60%
- Property Management: 50%
- Lead Management: 20%
- Visit Verification: 0%
- Income/Wallet: 10%
- Complaint Management: 0%
- Notices/Menu: 0%
- Admin Dashboard: 30%
- Listing Approval: 40%
- User Management: 20%
- Financial Controls: 0%
- Analytics: 0%
- Audit Logs: 0%
- Super Admin Panel: 0%

### BACKEND PROGRESS
- Core Schema: 70%
- Extended Models: 30%
- Auth System: 60%
- Role-Based Access: 50%
- Security Middleware: 40%
- Contact Masking: 0%
- Data Protection: 20%
- Booking Token System: 0%
- Payment Processing: 10%
- Virtual Accounts/Wallet: 0%
- Tiered Owner Billing: 0%
- Visit OTP Verification: 0%
- Lead Locking/Tracking: 0%
- Platform-Managed Visit Scheduling: 0%
- Anti-Circumvention Logic: 0%
- Commission Recovery Tracking: 0%
- KYC Verification Workflow: 20%
- Complaint System: 0%
- Audit Logging: 0%
- Analytics Engine: 0%
- Super Admin Controls: 0%
- Auth Endpoints: 50%
- Property Endpoints: 60%
- Owner Endpoints: 40%
- Admin Endpoints: 30%
- Webhook Endpoints: 20%
- Wishlist Endpoints: 50%
- KYC Endpoints: 30%

## Critical Gaps Section (Red Alert Boxes)
List the critical gaps requiring immediate attention:
1. Anti-Bypass System (PRD Section 3 & 5) - 0% implemented
2. Payment & Financial System (PRD Section 4) - 5% implemented  
3. Visit Verification & OTP System (PRD Sections 5.11 & 17.8) - 0% implemented
4. Lead Protection & Tracking (PRD Sections 5.4 & 17.2) - 0% implemented
5. Legal Agreement System (PRD Section 17) - 0% implemented
6. Admin/Super Admin Controls (PRD Section 9) - 15% implemented
7. Student/Owner Advanced Features (PRD Sections 7 & 8) - 25% implemented

## Technical Debt Section (Yellow Warning Boxes)
List technical debt areas:
- Missing conditional API data masking based on token payment status
- No UPI-only payment enforcement for booking tokens
- Missing wallet/ledger system for LivingGo Credits
- No visit scheduling or OTP verification system
- Missing dynamic inventory system for property room types
- Lack of comprehensive audit trail system
- Incomplete role-based access control enforcement

## Visual Timeline Section
Request a Gantt chart style timeline showing:
- Q3 2026: Anti-bypass system implementation
- Q3 2026: Payment & financial system completion
- Q4 2026: Visit verification & OTP system
- Q4 2026: Lead protection & tracking
- Q4 2026: Legal agreement system
- Q1 2027: Admin/super admin controls completion
- Q1 2027: Student/owner advanced features

## Design Requirements
- Use LivingGo brand colors (ink, clay, moss, linen from the codebase)
- Make it responsive and mobile-friendly
- Include tooltips on hover for detailed explanations
- Use Recharts for bar charts, progress bars, and circular gauges
- Include a legend and clear labels
- Make critical gaps stand out with red background
- Make technical debt stand out with yellow background
- Include a refresh button to simulate updating data

The dashboard should be a single React component that can be imported and used in the LivingGo application.
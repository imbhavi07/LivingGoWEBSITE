# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js App)
- Start dev server: `npm run dev` (runs on http://localhost:3000)
- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint` (uses ESLint)

### Backend (Express/TypeScript)
From the `backend/` directory:
- Install deps: `npm install`
- Generate Prisma client: `npm run prisma:generate`
- Run migrations: `npm run prisma:migrate`
- Seed DB: `npm run seed`
- Dev server (with tsx watch): `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint` (ESLint on src/)

### Environment
- Frontend: copy `.env.example` to `.env.local` and set:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud`
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset`
- Backend: copy `.env.example` to `.env` and set:
  - Database URL (PostgreSQL)
  - JWT secret
  - Cloudinary credentials
  - Resend API key (for owner OTP emails)
  - Email sender

## Code Architecture

### Frontend (`/`)
- **app/** – Next.js App Router pages and route groups
  - Public routes: `/`, `/properties/[id]`, `/wishlist`
  - Owner routes: `/owner/dashboard` (login/signup, listing management)
  - Admin routes: `/admin/dashboard` (moderation, approvals)
- **components/** – Reusable UI cards, forms, modals, navigation, skeleton loaders
- **hooks/** – Custom React hooks (e.g., data fetching, auth)
- **lib/** – Utility functions, Axios instance, API service wrappers
- **contexts/** – React context providers (e.g., auth)
- **types/** – TypeScript interfaces and types shared across frontend
- **assets/** – Images, icons, static assets
- **middleware.ts** – Route guard for protected pages (reads cookie for auth)

### Backend (`/backend/`)
- **src/** – TypeScript source
  - **server.ts** – Express app setup, middleware, route mounting
  - **routes/** – API route handlers split by domain:
    - `auth.ts` – public signup/login
    - `ownerAuth.ts` – owner OTP flow and JWT
    - `adminAuth.ts` – admin login
    - `properties.ts` – CRUD for listings (public and owner)
    - `wishlist.ts` – user wishlist operations
    - `owner.ts` – owner dashboard stats, property management
    - `admin.ts` – admin dashboard, listings moderation, user suspension
    - `uploads.ts` – Cloudinary image upload endpoint
  - **prisma/** – Prisma schema (`schema.datamodel`) and seed script
  - **middleware/** – Custom Express middlewares (validation, auth guards)
  - **utils/** – Helpers (password hashing, token generation)
- **prisma/** – Prisma migrations and generated client
- **.env** – Environment variables (not committed)

### Key Conventions
- TypeScript strict mode enabled in both frontend and backend
- Zod used for request validation in backend routes
- Axios instance in frontend lib/api.ts configured with baseURL from env
- JWT stored in localStorage; httpOnly cookie used for route guard readability
- Cloudinary used for image uploads via unsigned preset (frontend) and signed endpoint (backend)
- Tailwind CSS for styling; lucide-react for icons
- ESLint with Next.js and TypeScript configurations

## Student Dashboard Specifics
- Student dashboard uses `StudentShell.tsx` for layout with mobile drawer sidebar
- Navbar component automatically hides on student dashboard via pathname check
- Auth state managed through `useAuth()` hook from Clerk integration
- Sign out functionality uses `clerkSignOut()` followed by session clearing

## Common Tasks
- To add a new API endpoint: create route file in `backend/src/routes/`, register in `src/server.ts`
- To add a new frontend page: create route segment under `app/` (e.g., `app/new-page/page.tsx`)
- To modify database: edit `backend/prisma/schema.prisma`, run `prisma migrate dev`, regenerate client
- To update styles: edit Tailwind config (`tailwind.config.ts`) or use utility classes directly in JSX
- To run a specific test: (no test framework configured yet) – manual testing via dev servers
# LivingGo

Modern mobile-first student housing frontend built with Next.js App Router, TypeScript, Tailwind CSS, and Axios.

The unified Node/Express/PostgreSQL backend lives in `backend/`.

## Features

- Responsive listings grid with budget, location, room type, and preference filters
- Property details page with image gallery, facilities, pricing, owner info, and contact CTA
- Local wishlist with protected `/wishlist` route
- Desktop navbar and mobile bottom navigation
- Skeleton loading states, empty states, typed reusable components, hooks, and API services
- JWT session handling through local storage plus an HTTP-readable route-guard cookie
- Zod input validation and Axios error handling
- Owner dashboard at `/owner/dashboard` with login, signup, listing management, edit/delete/toggle, and Cloudinary image upload
- Internal admin dashboard at `/admin/dashboard` with moderation, listing approvals, user suspension, and spam deletion controls

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Backend

See `backend/README.md` for the Express, Prisma, PostgreSQL, JWT, and Cloudinary API setup.

## REST API Contracts

The frontend expects:

- `GET /properties`
- `GET /properties/:id`
- `POST /auth/login`
- `POST /owner/auth/login`
- `POST /owner/auth/signup`
- `GET /owner/dashboard/stats`
- `GET /owner/properties`
- `POST /owner/properties`
- `PUT /owner/properties/:id`
- `DELETE /owner/properties/:id`
- `PATCH /owner/properties/:id/status`
- `POST /admin/auth/login`
- `GET /admin/dashboard/stats`
- `GET /admin/listings`
- `GET /admin/listings/:id`
- `PATCH /admin/listings/:id/approve`
- `PATCH /admin/listings/:id/reject`
- `DELETE /admin/listings/:id`
- `GET /admin/users`
- `PATCH /admin/users/:id/suspend`
- `DELETE /admin/users/:id`

`POST /auth/login` should return:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Student Name",
    "email": "student@example.com"
  }
}
```

Until a backend is connected, listings and details can fall back to local mock data. Authentication requires the backend.

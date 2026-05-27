# LivingGo Backend

Scalable Express + TypeScript + PostgreSQL backend for the LivingGo student, owner, and admin platforms.

## Stack

- Node.js + Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcryptjs password hashing
- Cloudinary image uploads
- Helmet, CORS, rate limiting, Zod validation

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

## Resend

For owner OTP email verification you need:

- a Resend account
- one API key from the Resend dashboard
- one verified sender email or domain

Add these to `.env`:

```env
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=onboarding@resend.dev
```

For quick testing, `onboarding@resend.dev` is fine if allowed by your account. For production, switch to a verified domain sender like `noreply@livinggo.in`.

Seeded admin:

```text
admin@LivingGo.com
Admin@12345
```

Change this password immediately outside local development.

## API Base

```text
http://localhost:5000/api
```

## Main Routes

Auth:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /owner/auth/send-otp`
- `POST /owner/auth/verify-otp`
- `POST /owner/auth/signup`
- `POST /owner/auth/login`
- `POST /admin/auth/login`

Properties:
- `GET /properties`
- `GET /properties/:id`
- `POST /properties`
- `PUT /properties/:id`
- `DELETE /properties/:id`

Wishlist:
- `GET /wishlist`
- `POST /wishlist/:propertyId`
- `DELETE /wishlist/:propertyId`

Owner:
- `GET /owner/dashboard/stats`
- `GET /owner/properties`
- `POST /owner/properties`
- `PUT /owner/properties/:id`
- `PATCH /owner/properties/:id/status`
- `DELETE /owner/properties/:id`

Admin:
- `GET /admin/dashboard/stats`
- `GET /admin/listings`
- `GET /admin/listings/:id`
- `PATCH /admin/listings/:id/approve`
- `PATCH /admin/listings/:id/reject`
- `DELETE /admin/listings/:id`
- `GET /admin/users`
- `PATCH /admin/users/:id/suspend`
- `DELETE /admin/users/:id`
- `GET /admin/approvals`
- `GET /admin/approvals/:id`
- `PATCH /admin/approvals/:id/approve`
- `PATCH /admin/approvals/:id/reject`

Uploads:
- `POST /uploads/properties`

Protected requests require:

```text
Authorization: Bearer <jwt>
```

Frontend connection:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

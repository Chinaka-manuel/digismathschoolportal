# Northbridge School Management System

A production-oriented MERN foundation for a public school website and authenticated school operations portal.

## Current foundation

- React 19 + Vite + Tailwind CSS client with responsive public school homepage
- Axios, TanStack Query, Zustand, React Hook Form, Zod, Framer Motion, and React Router dependencies ready for portal features
- Express API with secure headers, restricted CORS, compression, request logging, rate limiting, and consistent responses
- MongoDB/Mongoose-ready `User`, `Student`, and `Admission` models with indexes
- JWT access-token middleware and role authorization boundary
- Public admissions submission with generated application numbers and reviewer-only status management
- Authenticated responsive portal dashboard with role-aware student/admission queries
- Provider-neutral payment initialization, signed idempotent webhook processing, and ownership-aware result access
- Normalized CMS and notification schema foundations for announcements, news, notifications, and configurable school settings
- Protected CMS CRUD for news and announcements with audit logging
- Staff listing, creation, assignment, and update endpoints with administrator authorization
- Attendance recording, ownership-aware attendance reads, summary aggregation, and secure document upload validation
- Cloudinary-backed profile image, video, and document uploads with no local media persistence
- Secure student QR verification tokens and printable/PDF-ready ID cards and result sheets
- Health endpoint at `GET /api/health`
- Environment-driven configuration with no committed secrets

## Run locally

```bash
cd client
npm run dev
```

```bash
cd server
npm install
npm run dev
```

The backend development command uses `nodemon` and restarts automatically when server files change.

Run the backend smoke tests with:

```bash
cd server
npm test
```

With MongoDB running and `MONGO_URI` configured, seed non-production demo data with:

```bash
cd server
npm run seed
```

The seed users use `@northbridge.test` addresses and the temporary password `ChangeMe123!`; change or remove these accounts before production use.

The health endpoint reports API and MongoDB status at `GET /api/health`. Production startup requires `MONGO_URI` and non-placeholder JWT secrets; development can run without MongoDB for public API checks.

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Provide a MongoDB connection string before enabling persistence. The frontend runs at `http://localhost:5173` and the API at `http://127.0.0.1:5000`.

Authentication routes now include `register`, `login`, `refresh`, `logout`, and `me`. Access tokens remain in memory on the client; refresh tokens are rotated in HTTP-only cookies.

Admissions endpoints include `POST /api/v1/admissions` for public submissions, `GET /api/v1/admissions` for authorized reviewers, and `PATCH /api/v1/admissions/:id/status` for status changes. Student lists are available to authorized staff at `GET /api/v1/students` with pagination, search, filtering, and sorting.

Administrative content is available under `/api/v1/cms`; staff management is available under `/api/v1/staff`. Both require an access token and role authorization.

Attendance endpoints are available under `/api/v1/attendance`; secure document uploads use `POST /api/v1/uploads/documents` with multipart field `documents`, a 5 MB per-file limit, and JPG/PNG/WEBP/PDF MIME validation.

Media endpoints use Cloudinary and require `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: `POST /api/v1/uploads/profile-image` accepts `image`, and `POST /api/v1/uploads/video` accepts `video`. The profile image URL is stored on the user record; video/document metadata is stored in `MediaAsset`.

Student-owned records are available at `GET /api/v1/students/me`. Each record receives a signed, expiring verification token for QR links. Public verification is available at `GET /api/v1/verify/student/:token` and returns only minimal verification fields. The client ID card and result sheet components support browser printing and PDF download.

Public settings are available at `GET /api/v1/settings/public`; contact submissions use `POST /api/v1/contact` and are rate-limited and stored as `ContactMessage` records.

PDF generation is lazy-loaded on download actions so the public homepage does not eagerly load the document-generation bundle.

## Architecture direction

The next slices should add route modules and service modules for authentication, admissions, students, staff, results, payments, notifications, CMS content, and reporting. Keep controllers thin, validate all request bodies server-side, keep refresh tokens in secure HTTP-only cookies, and never expose secrets or private student data through the client.
# digismathschoolportal

# FVPlace Nova — Futuristic Cloud Storage SaaS

FVPlace Nova یک بازطراحی کامل از پروژه قبلی است: یک پایه Production-ready برای Cloud Storage مدرن با UI/UX شبیه SaaS های آینده‌نگر 2026 و معماری جداشده Frontend/Backend.

## Tech Stack

- **Frontend:** Next.js App Router + TailwindCSS + reusable component structure
- **Backend:** Node.js + Express modular API
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT access/refresh tokens + OAuth extension points
- **Realtime:** Socket.io for upload progress, notifications and activity events
- **Storage:** S3-compatible object storage via AWS SDK
- **Security:** Helmet, CORS, rate limiting, validation with Zod, secure file access patterns

## What is included

### Frontend

- Glassmorphism + Cyberpunk dark UI
- Neon glow, animated background, smooth hover transitions
- Responsive SaaS shell and modern dashboard
- Storage usage cards, activity timeline and recent files
- Drag & Drop multi-file upload UI
- Upload queue with progress UI and Pause/Resume controls
- Right-click context menu actions
- Real-time search UI and lazy-load-ready file list
- Skeleton loading components
- Command Palette with `Ctrl + K`
- Toast-style notification dock
- Public profile and professional share/download pages

### Backend

- Modular Express app under `apps/api/src`
- JWT register/login/refresh endpoints
- OAuth provider route placeholders for Google/GitHub style handshakes
- Workspace model with Owner/Admin/Editor/Viewer roles
- File/folder model with parent-child hierarchy
- Upload to S3-compatible storage using memory upload + object keys
- Rename, move, delete, preview URL and create-folder APIs
- Share links with token hashing, optional password, expiry, download limits and QR code
- Activity timeline for upload/delete/rename/move/share/download/invite events
- Socket.io rooms per workspace for realtime events
- Public profile endpoint for public files

## Project Structure

```text
apps/
  api/
    src/
      config/          # env and MongoDB connection
      controllers/     # HTTP request handlers
      middleware/      # auth, validation/security, errors
      models/          # Mongoose schemas
      realtime/        # Socket.io setup
      routes/          # API route modules
      services/        # S3, share links, activity services
      utils/           # async wrappers and JWT helpers
  web/
    app/               # Next.js routes
    components/        # reusable UI, dashboard and file manager components
    lib/               # frontend API helpers
scripts/               # local checks
```

## Environment

Copy the sample file and fill production values:

```bash
cp .env.example .env
```

Important variables:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | S3-compatible storage credentials |
| `CORS_ORIGIN` | Frontend origin allowed by the API |
| `PUBLIC_APP_URL` | Public web URL for share links |
| `MAX_UPLOAD_MB` | Maximum file size |

## Development

```bash
npm install
npm run dev
```

Run only the API:

```bash
npm run dev:api
```

Run only the web app:

```bash
npm run dev:web
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/oauth/:provider`
- `GET /api/dashboard/summary`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `POST /api/workspaces/:id/invites`
- `GET /api/workspaces/:id/activity`
- `GET /api/files?workspaceId=...&parent=...&q=...&cursor=...`
- `POST /api/files/folders`
- `POST /api/files/upload`
- `PATCH /api/files/:id/rename`
- `PATCH /api/files/:id/move`
- `DELETE /api/files/:id`
- `GET /api/files/:id/preview`
- `POST /api/files/:fileId/share`
- `POST /api/share/:token/resolve`
- `GET /api/profiles/:username`

## Production Notes

- Configure real OAuth provider callbacks before enabling OAuth login in production.
- Use a virus scanning service or isolated worker for high-risk file types.
- Move large uploads to multipart direct-to-S3 upload for true pause/resume at scale.
- Put API and web behind HTTPS and set strict CORS origins.
- Use MongoDB indexes and object-storage lifecycle policies for cost control.

## Fix for the old `connect-mongo` startup error

If your host still shows `node src/server.js` and an error like `Cannot init client. Please provide correct options`, it is running the old EJS/session entrypoint. This version no longer uses `connect-mongo`; the canonical API entrypoint is:

```bash
npm start
# runs: node apps/api/src/server.js
```

A compatibility wrapper is also included at `src/server.js` for platforms that have cached the older start command. Make sure your deployment uses the updated `package.json`, set `MONGODB_URI`, and redeploy from a clean build cache.

## Recently added MVP upgrades

- Real login/register pages wired to the JWT API.
- File Manager now connects to workspaces and the files API when a user is authenticated.
- Drag & Drop upload sends real `FormData` requests and shows upload progress.
- Search is debounced and backed by the API text search when authenticated.
- Preview panel consumes secure preview URLs from the API.
- Share modal creates real password/limit-ready share links with QR output.
- Local object storage fallback is available for development when S3 variables are empty.

# FVPlace Nova — Self-contained Cloud Storage SaaS

FVPlace Nova ک پایه کاملاً خودمیزبان برای Cloud Storage مدرن است. این نسخه در زمان اجرا به سرویس‌های خارجی مثل Google، CDN، فونت خارجی، OAuth خارجی، S3 یا سایت‌های دیگر متکی نیست و همه چیز از API، UI، فایل‌ها و share preview تا QR placeholder داخل همین پروژه/سرور اجرا می‌شود.

## Tech Stack

- **Frontend:** Next.js App Router + TailwindCSS + reusable components
- **Backend:** Node.js + Express modular API
- **Database:** MongoDB + Mongoose
- **Authentication:** Local email/password + JWT access/refresh tokens
- **Realtime:** Socket.io for upload progress, notifications and activity events
- **Storage:** Local self-hosted filesystem storage under `LOCAL_STORAGE_DIR`
- **Security:** Helmet, CORS, rate limiting, validation with Zod, secure local file streaming

## Self-contained runtime policy

- No Google Fonts, analytics, maps, OAuth or third-party widgets.
- No CDN or remote script/style/image dependency.
- No S3-compatible external storage dependency in runtime.
- Share QR output is generated as an inline SVG data URL, not fetched from another service.
- File preview URLs point back to this API through `/api/storage/:encodedKey`.
- `NEXT_TELEMETRY_DISABLED=1` is included in `.env.example` for local/self-hosted deployments.

## What is included

### Frontend

- Glassmorphism + Cyberpunk dark UI
- Neon glow, animated background, smooth hover transitions
- Responsive SaaS shell and modern dashboard
- Storage usage cards, activity timeline and recent files
- Drag & Drop multi-file upload UI
- Upload queue with progress UI
- Right-click context menu actions
- Real-time search UI and lazy-load-ready file list
- Skeleton loading components
- Command Palette with `Ctrl + K`
- Toast-style notification dock
- Public profile and professional share/download pages
- Local login/register screens wired to the JWT API

### Backend

- Modular Express app under `apps/api/src`
- JWT register/login/refresh endpoints
- Workspace model with Owner/Admin/Editor/Viewer roles
- File/folder model with parent-child hierarchy
- Upload to local self-hosted storage using object-like keys
- Rename, move, delete, preview URL and create-folder APIs
- Share links with token hashing, optional password, expiry, download limits and inline QR placeholder
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
      services/        # local storage, share links, activity services
      utils/           # async wrappers and JWT helpers
  web/
    app/               # Next.js routes
    components/        # reusable UI, dashboard and file manager components
    lib/               # frontend API/auth helpers
scripts/               # local checks
```

## Environment

Copy the sample file and fill local production values:

```bash
cp .env.example .env
```

Important variables:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `LOCAL_STORAGE_DIR` | Local directory used for uploaded files |
| `CORS_ORIGIN` | Frontend origin allowed by the API |
| `PUBLIC_APP_URL` | Public web URL for self-hosted share links |
| `MAX_UPLOAD_MB` | Maximum file size |
| `NEXT_TELEMETRY_DISABLED` | Keeps Next.js telemetry disabled for self-contained deployments |

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
- `GET /api/storage/:encodedKey`
- `POST /api/files/:fileId/share`
- `POST /api/share/:token/resolve`
- `GET /api/profiles/:username`

## Production Notes

- Put API and web behind HTTPS and set strict CORS origins.
- Mount `LOCAL_STORAGE_DIR` on persistent disk/volume before deploying.
- Back up MongoDB and `LOCAL_STORAGE_DIR` together so file metadata and binary files stay consistent.
- Use a local virus scanning worker if you want high-security upload scanning without relying on external services.
- Use MongoDB indexes and filesystem lifecycle/backup policies for cost control.

## Fix for the old `connect-mongo` startup error

If your host still shows `node src/server.js` and an error like `Cannot init client. Please provide correct options`, it is running the old EJS/session entrypoint. This version no longer uses `connect-mongo`; the canonical API entrypoint is:

```bash
npm start
# runs: node apps/api/src/server.js
```

A compatibility wrapper is also included at `src/server.js` for platforms that have cached the older start command. Make sure your deployment uses the updated `package.json`, set `MONGODB_URI`, and redeploy from a clean build cache.

## Recently added MVP upgrades

- Real login/register pages wired to the local JWT API.
- File Manager now connects to workspaces and the files API when a user is authenticated.
- Drag & Drop upload sends real `FormData` requests and shows upload progress.
- Search is debounced and backed by the API text search when authenticated.
- Preview panel consumes secure preview URLs from the same API.
- Share modal creates self-hosted share links with inline QR output.
- Local object storage is the default and only runtime storage backend.

# Deployment Guide — Vishwakarma Cooperative Society Bank

## Architecture

```
                        Netlify                          Render
┌──────────────────────────────┐    ┌──────────────────────────────┐
│      React + Vite SPA       │    │   Node.js + Express API      │
│                              │    │                              │
│  VITE_API_URL ───────────────┼───►│  /api/auth    (Clerk JWT)    │
│  VITE_CLERK_PUBLISHABLE_KEY │    │  /api/requests (RBAC)        │
│                              │    │  /api/admin    (Admin only)  │
│  Deployed via:               │    │  /api/super-admin (Super)    │
│  - Netlify Git integration   │    │                              │
│  - Or CLI: netlify deploy    │    │  Deployed via:               │
└──────────────────────────────┘    │  - Render Blueprint          │
                                    │  - Or Git integration        │
                                    └──────────┬───────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────────────┐
                                    │     PostgreSQL Database       │
                                    │  (Supabase / Neon / Render)  │
                                    │                              │
                                    │  DATABASE_URL ───────────────┤
                                    └──────────────────────────────┘
```

## Prerequisites

- **Node.js** 20+ and npm
- **Git**
- Accounts: [Netlify](https://netlify.com), [Render](https://render.com), [Clerk](https://clerk.com)
- PostgreSQL provider: [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Render PostgreSQL](https://render.com)

---

## 1. Clerk Setup

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **Add Application**
2. Name: `Vishwakarma Cooperative Bank`
3. Enable: **Email/Password**, **Google OAuth**
4. Optional: Enable MFA/2FA under **Security**
5. Copy the keys:
   - **Publishable Key** → Frontend `.env`
   - **Secret Key** → Backend `.env`

---

## 2. PostgreSQL Database

### Option A: Render PostgreSQL
Render creates a DB automatically from `render.yaml`. Connection string is injected as `DATABASE_URL`.

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy connection string from Project Settings → Database
3. Format: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

### Option C: Neon
1. Go to [neon.tech](https://neon.tech) → New Project
2. Copy connection string from dashboard

### Run migrations:
```bash
cd backend-node
npm run db:migrate
npm run db:seed
```

---

## 3. Frontend (Netlify)

### Files to configure:
- `frontend/.env.example` → copy to `.env` and fill values
- `frontend/netlify.toml` → SPA redirects + security headers
- `frontend/public/_redirects` → fallback SPA routing

### Environment variables (set in Netlify dashboard):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=Vishwakarma Cooperative Society Bank
VITE_APP_URL=https://your-site.netlify.app
```

### Deploy via Git:
1. Push frontend to GitHub/GitLab
2. Netlify → Add New Site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables above

### Deploy via CLI:
```bash
npx netlify-cli deploy --prod --dir=dist
```

---

## 4. Backend (Render)

### Files to configure:
- `backend-node/.env.example` → copy to `.env` for local dev
- `backend-node/render.yaml` → Infrastructure-as-code

### Environment variables (set in Render dashboard):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | `sk_live_YOUR_CLERK_SECRET_KEY` |
| `FRONTEND_URL` | `https://your-site.netlify.app` |
| `RATE_LIMIT_WINDOW_MS` | `60000` |
| `RATE_LIMIT_MAX` | `100` |

### Deploy via Render Blueprint:
1. Push `render.yaml` + backend to GitHub
2. Render → Blueprint → Connect repo
3. Render auto-creates the Web Service + PostgreSQL

### Deploy manually:
1. Render → New Web Service → Connect repo
2. Root directory: `backend-node`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add environment variables
6. Create a separate Render PostgreSQL and copy the connection string

### After deploy:
- Run `npm run db:migrate` via Render Shell or SSH
- Run `npm run db:seed`

---

## 5. Clerk Webhook (Sync Users)

Set up a Clerk webhook to sync users to the local database:

1. Clerk Dashboard → Webhooks → Add Endpoint
2. Endpoint: `https://your-backend.onrender.com/api/auth/webhook`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. (Optional) Verify signing secret in backend

---

## 6. Verify Deployment

```bash
# Backend health check
curl https://your-backend.onrender.com/api/health
# → { "status": "UP", "timestamp": "..." }

# Frontend
open https://your-site.netlify.app
```

---

## Folder Structure

```
vishwakarma-cooperative/
├── frontend/                    # React + Vite SPA
│   ├── public/
│   │   ├── logo.png
│   │   ├── favicon.ico
│   │   └── _redirects           # Netlify SPA fallback
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── services/
│   │   │   ├── api.js           # GET/POST/PUT/DELETE wrapper
│   │   │   └── errorHandler.js  # Error handling utilities
│   │   ├── hooks/               # Custom React hooks
│   │   ├── i18n/                # i18n (EN/KN)
│   │   ├── context/             # React context providers
│   │   ├── App.jsx, App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── netlify.toml
│   ├── package.json
│   └── vite.config.js
│
├── backend-node/                # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # PostgreSQL pool + query helper
│   │   │   ├── cors.js          # CORS configuration
│   │   │   ├── migrate.js       # DB schema migrations
│   │   │   └── seed.js          # Seed roles + permissions
│   │   ├── middleware/
│   │   │   ├── auth.js          # Clerk JWT verification + RBAC
│   │   │   ├── errorHandler.js  # Global error handler
│   │   │   └── audit.js         # Audit logging middleware
│   │   ├── routes/
│   │   │   ├── auth.js          # Clerk webhook + /me
│   │   │   ├── requests.js      # Service requests CRUD
│   │   │   ├── documents.js     # File upload/download
│   │   │   ├── notifications.js # Notification system
│   │   │   ├── customers.js     # Customer dashboard/profile
│   │   │   ├── staff.js         # Staff assigned requests
│   │   │   ├── admin.js         # Admin user/request mgmt
│   │   │   ├── superAdmin.js    # Super admin system mgmt
│   │   │   ├── visitors.js      # Visitor tracking
│   │   │   ├── analytics.js     # Reports & analytics
│   │   │   └── contact.js       # Contact form
│   │   └── index.js             # Express server entry
│   ├── .env.example
│   ├── render.yaml              # Render Blueprint (IaaS)
│   ├── package.json
│   └── README.md
│
├── DEPLOYMENT.md                # This file
└── README.md
```

---

## Security Best Practices

### Frontend
- Clerk publishable key exposed is safe (it's public by design)
- Secret keys never in frontend code or `.env` committed to Git
- `netlify.toml` adds security headers (CSP, HSTS, X-Frame-Options)
- `_redirects` prevents SPA 404s

### Backend
- CORS allowlist: only Netlify domain + localhost
- Clerk JWT verification on every protected route
- RBAC via `requireRole()` and `requirePermission()` middleware
- Rate limiting: 100 requests/minute per IP
- Helmet.js for HTTP security headers
- Input validation on all routes
- File upload: type whitelist, size limit, UUID naming
- Audit logging on sensitive operations
- `.env` never committed (in `.gitignore`)
- PostgreSQL connection uses SSL in production

### Database
- Connection string stored as Render environment variable (not in code)
- Parameterized queries prevent SQL injection
- Role-based data access in queries
- `pg` pool with connection limits

---

## Environment Variable Reference

### Frontend (Netlify)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `VITE_API_URL` | Yes | Backend URL (e.g. `https://api.onrender.com/api`) |
| `VITE_APP_NAME` | No | Application name |
| `VITE_APP_URL` | No | Public site URL |

### Backend (Render)
| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Server port (Render sets this) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `FRONTEND_URL` | Yes | CORS allowed origin |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default: 60000) |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |
| `UPLOAD_DIR` | No | File upload directory (default: `uploads`) |
| `MAX_FILE_SIZE` | No | Max upload size in bytes (default: 10485760) |

---

## API Connection Examples

### Frontend `api.js` usage:

```jsx
import api from '../services/api'
import { getToken } from '@clerk/clerk-react'

// GET
const requests = await api.get('/requests', { token })

// POST
const newRequest = await api.post('/requests', {
  type: 'LOAN',
  description: 'Need a home loan',
}, { token })

// PUT
const updated = await api.put(`/requests/${id}/status`, {
  status: 'RESOLVED',
}, { token })

// DELETE
await api.delete(`/documents/${id}`, { token })
```

### Error handling:
```jsx
import api from '../services/api'
import { getErrorMessage } from '../services/errorHandler'

try {
  const data = await api.get('/requests', { token })
} catch (err) {
  const message = getErrorMessage(err)
  setError(message)
}
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Backend health check returns 404 | Port mismatch on Render | Check `PORT` env var |
| CORS errors in browser | `FRONTEND_URL` mismatch or missing | Verify Render env var matches Netlify URL |
| Clerk login fails | Wrong publishable key | Check `VITE_CLERK_PUBLISHABLE_KEY` |
| Database connection fails | `DATABASE_URL` wrong or SSL disabled | Use `?sslmode=require` in production |
| Webhook not syncing users | URL wrong or signing secret missing | Verify webhook endpoint in Clerk Dashboard |
| File upload fails (413) | Request body too large | Check `express.json({ limit })` and Render proxy settings |
| 429 Too Many Requests | Rate limit hit | Increase `RATE_LIMIT_MAX` in env vars |

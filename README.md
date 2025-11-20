# ScamCatcher

Full-stack React + Node/Express project for fraud report/search.

## Requirements
- Node.js 18+
- npm 9+
- MongoDB Atlas cluster (or local MongoDB)
- Blacklistseller API key (optional but recommended)

## Project Structure
```
root/
├─ src/          # React + Vite frontend
├─ server/       # Express + MongoDB API
├─ .env          # frontend env (copy from .env.example)
└─ server/.env   # backend env (copy from server/.env.example)
```

## Quick Start (Development)
1. Install dependencies
   ```bash
   npm install
   cd server && npm install && cd ..
   ```
2. Copy env files and fill placeholders
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```
3. Run backend API (port 4010 by default)
   ```bash
   cd server
   npm run dev
   ```
4. Run frontend (port 5173)
   ```bash
   npm run dev
   ```

## Data Entry Requirements
- All fraud-report and search forms now require **first name** and **last name** fields. Any automated scripts, seeds, or fixtures must provide `firstName` and `lastName` (the legacy `name` string is treated only as a fallback).
- Backend tests were updated to send the split fields; if you add new tests or data importers they must do the same.
- External integrations (e.g., CSV/import pipelines) should normalize names into `firstName`/`lastName` before calling the API so the Blacklistseller provider receives a valid payload.

## Environment Variables
### Frontend (.env)
- `VITE_API_BASE_URL` – Base URL of the API (e.g. `https://api.yourdomain.com/api`)
- `VITE_EXTERNAL_CHECKS_ENABLED` – Toggle external lookup UI (`true`/`false`)

### Backend (server/.env)
See `server/.env.example`, key variables include:
- `MONGODB_URI`
- `JWT_SECRET`
- `BLACKLISTSELLER_API_KEY`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` (สำหรับส่งอีเมลรีเซ็ตรหัสผ่าน)
- `FRONTEND_BASE_URL` หรือ `RESET_PASSWORD_URL` (ใช้สร้างลิงก์รีเซ็ตรหัสผ่านในอีเมล)
- `SMTP_DEV_MODE=true` หากต้องการโหมด dev ที่ไม่ส่งอีเมลจริงแต่พิมพ์ preview ใน log
- `ALLOWED_ORIGINS`
- `COOKIE_DOMAIN`
- `TRUST_PROXY`
- `USE_MEMORY_DB` / `MEMORY_DB_FALLBACK`
- `LOG_LEVEL`

## Production Build & Deploy
1. Set `NODE_ENV=production` and fill all env vars above with production values (MongoDB Atlas URI, real JWT secret, allowed origins, cookie domain, etc.)
2. Build the frontend once: `npm run build`
3. Copy `dist/` into the server host; the Express server already serves static files from `dist`
4. Start backend: `cd server && npm run start`
5. Ensure HTTPS/Reverse proxy forwards `X-Forwarded-*` headers and that `TRUST_PROXY` is set appropriately
6. Configure logging/monitoring and backups as needed

### Render + MongoDB Atlas Notes
- Create a Render Web Service pointing to `server` folder and run `npm install && npm run start`
- Store env vars in Render dashboard (`MONGODB_URI`, `JWT_SECRET`, `BLACKLISTSELLER_API_KEY`, `ALLOWED_ORIGINS`, `COOKIE_DOMAIN`, `TRUST_PROXY`)
- Build the frontend separately (Render Static Site) or deploy the `dist` folder via the API container

## Scripts
| Location | Command | Description |
|----------|---------|-------------|
| root     | `npm run dev` | Start Vite dev server |
| root     | `npm run build` | Build frontend assets |
| root     | `npm run preview` | Preview built frontend |
| root     | `npm run test` | Run backend tests via server package |
| server   | `npm run dev` | Start Express API in watch mode |
| server   | `npm run start` | Start Express API for production |
| server   | `npm run test` | Run API tests |

## Testing
Backend unit/integration tests use `node --test` with `mongodb-memory-server`. Run from project root:
```bash
npm run test
```

## Deployment Checklist
- [ ] Set production env vars (see above)
- [ ] Build frontend (`npm run build`)
- [ ] Start backend with `npm run start` inside `server`
- [ ] Configure HTTPS and `TRUST_PROXY`
- [ ] Provide persistent storage for `/server/uploads`
- [ ] Monitor logs (pino output to stdout)

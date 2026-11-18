# Qubex Tech Solutions — Project Enquiry Management Setup Guide

## 1. Live Application Runtime (Node.js + Express + MySQL / SQLite)

The AI Studio / Cloud Run deployment runs via `server.ts` on port `3000`:

- **Database**: Connects automatically to MySQL (`mysql2`) when `MYSQL_HOST` and `MYSQL_DATABASE` (or `MYSQL_URL`) are set in `.env`. When omitted in local/sandbox environments, it persists permanently to `./data/qubex_enquiries.db` (SQLite) using the identical `project_enquiries`, `admin_users`, and `admin_sessions` table schemas.
- **Email Notifications**: Uses `nodemailer` with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `ADMIN_NOTIFICATION_EMAIL`. Email errors are caught safely without losing the saved database enquiry.
- **Admin Dashboard**: Visit `/admin-dashboard` (default dev bootstrap credentials: `admin@qubextech.com` / `QubexAdmin@2026` — override immediately via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`).

---

## 2. Standalone Python Django + DRF + MySQL Backend (`django_backend/`)

The `django_backend/` project is ready for both local Python hosting and **Vercel Python Serverless (`vercel.json` + `qubex_backend/wsgi.py`)**.

### Vercel Deployment Checklist (`djangobackend-omega.vercel.app`)
1. Set the Vercel **Root Directory** to `django_backend`.
2. Add your Cloud MySQL environment variables in Vercel Project Settings (for example Railway, Aiven, TiDB, or PlanetScale):
   - `MYSQL_URL` (or `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`)
   - `DJANGO_SECRET_KEY` (at least 32 random chars)
   - `ADMIN_EMAIL` & `ADMIN_PASSWORD` (used to auto-bootstrap your staff admin login)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_NOTIFICATION_EMAIL`
   - *(Note: When no remote `MYSQL_HOST`/`MYSQL_URL` is configured on Vercel, `settings.py` falls back safely to `/tmp/qubex_enquiries.sqlite3` so the function boots without `500 FUNCTION_INVOCATION_FAILED` — configure a hosted MySQL database for permanent persistence on serverless.)*
3. To connect a separately hosted frontend to the Django Vercel backend, set `VITE_API_BASE_URL="https://djangobackend-omega.vercel.app"` in the frontend build environment. Leaving `VITE_API_BASE_URL` empty uses the built-in `/api/*` backend automatically.

### Local MySQL Setup
```sql
CREATE DATABASE qubex_enquiries CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qubex_user'@'localhost' IDENTIFIED BY 'your_strong_mysql_password';
GRANT ALL PRIVILEGES ON qubex_enquiries.* TO 'qubex_user'@'localhost';
FLUSH PRIVILEGES;
```

### Install Dependencies & Run Migrations Locally
```bash
cd django_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### API Endpoints
- `GET /` — Backend & database health summary JSON
- `GET /api/health` — Database connectivity check
- `GET /api/csrf-token` — Issue CSRF cookie & token
- `POST /api/enquiries` — Validate & save customer enquiry + dispatch admin SMTP email
- `POST /api/admin/auth/login` — Admin authentication (session cookie + signed Bearer `sessionToken`)
- `GET /api/admin/auth/me` — Verify authenticated admin session
- `POST /api/admin/auth/logout` — Destroy admin session
- `GET /api/admin/enquiries` — List, search & filter enquiries + KPI counts
- `GET /api/admin/enquiries/export?format=csv|xlsx` — Export filtered enquiries to CSV or Excel
- `GET /api/admin/enquiries/:id` — Retrieve single enquiry details
- `PATCH /api/admin/enquiries/:id` — Update `status` (`New`, `Contacted`, `In Progress`, `Completed`, `Rejected`) and `admin_notes`
- `DELETE /api/admin/enquiries/:id` — Permanently delete an enquiry

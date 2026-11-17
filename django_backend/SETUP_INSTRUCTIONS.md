# Qubex Tech Solutions — Project Enquiry Management Setup Guide

## 1. Live Application Runtime (Node.js + Express + MySQL / SQLite)

The AI Studio / Cloud Run deployment runs via `server.ts` on port `3000`:

- **Database**: Connects automatically to MySQL (`mysql2`) when `MYSQL_HOST` and `MYSQL_DATABASE` (or `MYSQL_URL`) are set in `.env`. When omitted in local/sandbox environments, it persists permanently to `./data/qubex_enquiries.db` (SQLite) using the identical `project_enquiries`, `admin_users`, and `admin_sessions` table schemas.
- **Email Notifications**: Uses `nodemailer` with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `ADMIN_NOTIFICATION_EMAIL`. Email errors are caught safely without losing the saved database enquiry.
- **Admin Dashboard**: Visit `/admin-dashboard` (default dev bootstrap credentials: `admin@qubextech.com` / `QubexAdmin@2026` — override immediately via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`).

---

## 2. Standalone Python Django + DRF + MySQL Backend (`django_backend/`)

To run the standalone Python Django + Django REST Framework + MySQL API service on a Python host:

### Create MySQL Database
```sql
CREATE DATABASE qubex_enquiries CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qubex_user'@'localhost' IDENTIFIED BY 'your_strong_mysql_password';
GRANT ALL PRIVILEGES ON qubex_enquiries.* TO 'qubex_user'@'localhost';
FLUSH PRIVILEGES;
```

### Install Dependencies & Run Migrations
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
- `GET /api/csrf-token` — Issue CSRF cookie & token
- `POST /api/enquiries` — Validate & save customer enquiry + dispatch admin SMTP email
- `POST /api/admin/auth/login` — Admin authentication (session cookie + CSRF token)
- `GET /api/admin/auth/me` — Verify authenticated admin session
- `POST /api/admin/auth/logout` — Destroy admin session
- `GET /api/admin/enquiries` — List, search & filter enquiries + KPI counts
- `GET /api/admin/enquiries/export?format=csv|xlsx` — Export filtered enquiries to CSV or Excel
- `GET /api/admin/enquiries/:id` — Retrieve single enquiry details
- `PATCH /api/admin/enquiries/:id` — Update `status` (`New`, `Contacted`, `In Progress`, `Completed`, `Rejected`) and `admin_notes`
- `DELETE /api/admin/enquiries/:id` — Permanently delete an enquiry

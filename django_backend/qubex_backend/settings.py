import os
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv
import pymysql

# PyMySQL compatibility shim for Django 5.1
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")

IS_VERCEL = bool(os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"))

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    os.environ.get("SESSION_SECRET", "qubex-tech-solutions-dev-secret-key-change-in-prod"),
)
DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,.vercel.app,.run.app",
    ).split(",")
    if h.strip()
]
vercel_url = os.environ.get("VERCEL_URL", "").strip()
if vercel_url and vercel_url not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(vercel_url)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "enquiries",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "qubex_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "qubex_backend.wsgi.application"


def _build_database_config():
    mysql_url = os.environ.get("MYSQL_URL", "").strip() or os.environ.get("DATABASE_URL", "").strip()
    if mysql_url and mysql_url.startswith("mysql"):
        parsed = urlparse(mysql_url)
        return {
            "ENGINE": "django.db.backends.mysql",
            "NAME": parsed.path.lstrip("/") or os.environ.get("MYSQL_DATABASE", "qubex_enquiries"),
            "USER": parsed.username or os.environ.get("MYSQL_USER", "qubex_user"),
            "PASSWORD": parsed.password or os.environ.get("MYSQL_PASSWORD", ""),
            "HOST": parsed.hostname or "127.0.0.1",
            "PORT": str(parsed.port or os.environ.get("MYSQL_PORT", "3306")),
            "OPTIONS": {
                "charset": "utf8mb4",
                "connect_timeout": 5,
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }

    mysql_host = os.environ.get("MYSQL_HOST", "").strip()
    mysql_db = os.environ.get("MYSQL_DATABASE", "").strip()
    is_local_mysql_on_vercel = IS_VERCEL and mysql_host in ("", "127.0.0.1", "localhost")

    if mysql_host and mysql_db and not is_local_mysql_on_vercel:
        return {
            "ENGINE": "django.db.backends.mysql",
            "NAME": mysql_db,
            "USER": os.environ.get("MYSQL_USER", "qubex_user"),
            "PASSWORD": os.environ.get("MYSQL_PASSWORD", ""),
            "HOST": mysql_host,
            "PORT": os.environ.get("MYSQL_PORT", "3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
                "connect_timeout": 5,
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }

    sqlite_path = (
        Path("/tmp/qubex_enquiries.sqlite3")
        if IS_VERCEL
        else BASE_DIR / "db.sqlite3"
    )
    return {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(sqlite_path),
    }


DATABASES = {
    "default": _build_database_config(),
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "enquiries.auth.BearerTokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAdminUser",
    ],
}

CORS_ALLOW_CREDENTIALS = True
raw_cors_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "").strip()
if raw_cors_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in raw_cors_origins.split(",") if o.strip()]
    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
else:
    CORS_ALLOW_ALL_ORIGINS = True
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://*.run.app",
    ]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-csrf-token",
    "x-requested-with",
]

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = IS_VERCEL or not DEBUG
SESSION_COOKIE_SAMESITE = "None" if SESSION_COOKIE_SECURE else "Lax"
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE
CSRF_COOKIE_SAMESITE = SESSION_COOKIE_SAMESITE

# SMTP Email Configuration
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("SMTP_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("SMTP_SECURE", "false").lower() != "true"
EMAIL_USE_SSL = os.environ.get("SMTP_SECURE", "false").lower() == "true"
EMAIL_HOST_USER = os.environ.get("SMTP_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("SMTP_PASS", "")
DEFAULT_FROM_EMAIL = os.environ.get(
    "SMTP_FROM",
    EMAIL_HOST_USER or "no-reply@qubextechsolutions.com",
)
ADMIN_NOTIFICATION_EMAIL = os.environ.get(
    "ADMIN_NOTIFICATION_EMAIL",
    "qubex.tech.solutions@gmail.com",
)

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

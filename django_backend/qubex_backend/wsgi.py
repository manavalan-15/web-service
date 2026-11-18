import os
import threading
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "qubex_backend.settings")

_init_lock = threading.Lock()
_initialized = False


def _bootstrap_runtime() -> None:
    global _initialized
    if _initialized:
        return
    with _init_lock:
        if _initialized:
            return
        try:
            from django.core.management import call_command
            from django.contrib.auth import get_user_model
            from django.db import connections

            conn = connections["default"]
            existing_tables = conn.introspection.table_names()
            if "project_enquiries" not in existing_tables or "auth_user" not in existing_tables:
                call_command("migrate", interactive=False, verbosity=0)

            User = get_user_model()
            admin_email = (os.environ.get("ADMIN_EMAIL") or "admin@qubextech.com").strip().lower()
            admin_username = (os.environ.get("ADMIN_USERNAME") or "qubexadmin").strip()
            admin_password = (os.environ.get("ADMIN_PASSWORD") or "QubexAdmin@2026").strip()

            if not User.objects.filter(is_staff=True).exists():
                User.objects.create_superuser(
                    username=admin_username,
                    email=admin_email,
                    password=admin_password,
                )
        except Exception as exc:
            # Never fail WSGI module import; endpoints report status safely
            print(f"[Qubex Django Bootstrap Warning]: {exc}")
        finally:
            _initialized = True


django.setup()
_bootstrap_runtime()

application = get_wsgi_application()
app = application

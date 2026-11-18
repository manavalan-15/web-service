from typing import Optional, Tuple
from django.contrib.auth import get_user_model
from django.core import signing
from rest_framework import authentication, exceptions

TOKEN_SALT = "qubex-admin-session-v1"
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 12  # 12 hours


def issue_admin_token(user_id: int) -> str:
    return signing.dumps({"uid": user_id}, salt=TOKEN_SALT)


def verify_admin_token(token: str) -> Optional[int]:
    try:
        payload = signing.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE_SECONDS)
        uid = payload.get("uid")
        return int(uid) if uid is not None else None
    except signing.BadSignature:
        return None
    except Exception:
        return None


class BearerTokenAuthentication(authentication.BaseAuthentication):
    """Stateless signed Bearer authentication for cross-origin & iframe admin sessions."""

    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[object, str]]:
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header:
            return None
        parts = auth_header.split(None, 1)
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            return None

        raw_token = parts[1].strip()
        user_id = verify_admin_token(raw_token)
        if user_id is None:
            raise exceptions.AuthenticationFailed("Invalid or expired admin session token.")

        User = get_user_model()
        user = User.objects.filter(pk=user_id, is_active=True, is_staff=True).first()
        if not user:
            raise exceptions.AuthenticationFailed("Administrator account not found or inactive.")
        return (user, raw_token)

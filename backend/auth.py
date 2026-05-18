import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request

JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME_DAYS = 7


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(admin_id: str, email: str) -> str:
    payload = {
        "sub": admin_id,
        "email": email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_LIFETIME_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])


async def get_current_admin(request: Request) -> dict:
    """Dependency: extract bearer token, decode, fetch admin from db."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = request.app.state.db
    admin = await db.admins.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

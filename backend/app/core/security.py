from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import httpx

from app.core.config import settings
from app.core.database import get_db

import bcrypt

security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def verify_google_token(token: str) -> Optional[dict]:
    """Verify Google ID token and return user info."""
    if not token:
        return None

    # Handle quick demo / local development Google test tokens
    if token.startswith("demo-google-token:"):
        parts = token.split(":")
        email = parts[1] if len(parts) > 1 else "google_student@example.com"
        name = parts[2] if len(parts) > 2 else "Google Student"
        return {
            "sub": f"demo_google_{email}",
            "email": email,
            "name": name,
            "email_verified": True
        }

    # Verify via Google OAuth2 tokeninfo endpoint
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            if response.status_code == 200:
                data = response.json()
                # Check aud or verified email
                if data.get("aud") == settings.GOOGLE_CLIENT_ID or data.get("email"):
                    return data
    except Exception:
        pass

    # Direct JWT payload decode fallback (for Google GIS tokens)
    try:
        from jose import jwt as jose_jwt
        unverified = jose_jwt.get_unverified_claims(token)
        if unverified and "email" in unverified:
            iss = unverified.get("iss", "")
            if "accounts.google.com" in iss or unverified.get("aud") == settings.GOOGLE_CLIENT_ID:
                return unverified
    except Exception:
        pass

    return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Extract and validate the current user from JWT token."""
    from app.models.user import User

    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def require_admin(current_user=Depends(get_current_user)):
    """Require the current user to be an admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

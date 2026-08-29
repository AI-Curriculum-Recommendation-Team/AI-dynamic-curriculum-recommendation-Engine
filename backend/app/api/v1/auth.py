from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    verify_google_token, get_current_user
)
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, GoogleAuthRequest, Token, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Determine role (first user with ADMIN_EMAIL becomes admin)
    role = "admin" if user_data.email == settings.ADMIN_EMAIL else "user"

    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-create student profile
    from app.models.student import Student
    student = Student(user_id=user.id, full_name=user_data.full_name)
    db.add(student)
    db.commit()

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/google", response_model=Token)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth ID token."""
    google_user = await verify_google_token(request.id_token)
    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    email = google_user.get("email")
    google_id = google_user.get("sub")
    name = google_user.get("name", email.split("@")[0] if email else "User")

    # Find existing user by Google ID or email
    user = (
        db.query(User).filter(User.google_id == google_id).first() or
        db.query(User).filter(User.email == email).first()
    )

    if not user:
        # Create new user
        role = "admin" if email == settings.ADMIN_EMAIL else "user"
        user = User(
            email=email,
            google_id=google_id,
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Auto-create student profile
        from app.models.student import Student
        student = Student(user_id=user.id, full_name=name)
        db.add(student)
        db.commit()
    else:
        # Update Google ID if logging in via Google for the first time
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user


@router.post("/logout")
async def logout():
    """Logout (client should delete the token)."""
    return {"message": "Logged out successfully"}

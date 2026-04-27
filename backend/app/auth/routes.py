from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.db import SessionLocal
from app.models.user import User
from app.auth.auth import hash_password, verify_password, create_access_token

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register
@router.post("/register")
def register(name: str, email: str, password: str, role: str = "student", db: Session = Depends(get_db)):
    hashed = hash_password(password)

    user = User(
        name=name,
        email=email,
        password=hashed,
        role=role
    )

    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

    return {"message": "User created"}

# Login
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}

    token = create_access_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "access_token": token,
        "user": user.name,
        "role": user.role,
        "user_id": user.id
    }
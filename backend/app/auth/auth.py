from passlib.context import CryptContext
from jose import jwt

SECRET_KEY = "secret"  # change later
ALGORITHM = "HS256"

# Use PBKDF2-SHA256 as default because it is stable across environments
# and avoids known bcrypt backend compatibility issues in some setups.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    default="pbkdf2_sha256",
    deprecated="auto",
)

# Hash password
def hash_password(password: str):
    return pwd_context.hash(password)

# Verify password
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# Create JWT token
def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
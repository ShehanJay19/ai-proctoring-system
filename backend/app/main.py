from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.services.pipeline import analyze_frame
from app.auth.routes import router as auth_router
from app.database.db import Base, engine

# Create FastAPI app
app = FastAPI(title="AI Proctoring System")

# Create DB tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth_router, prefix="/auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    # Simple test route
    return {"message": "Server running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Read uploaded image as bytes
    image_bytes = await file.read()

    # Send image to AI pipeline
    result = analyze_frame(image_bytes)

    # Return analysis result
    return result
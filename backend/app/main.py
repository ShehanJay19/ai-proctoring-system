from fastapi import FastAPI, UploadFile, File
from app.services.pipeline import analyze_frame

# Create FastAPI app
app = FastAPI(title="AI Proctoring System")

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
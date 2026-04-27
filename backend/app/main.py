from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.auth.dependencies import get_current_user
from app.auth.routes import router as auth_router
from app.database.db import Base, SessionLocal, engine
from app.models.violation import Violation
from app.realtime import alert_manager
from app.routes.exam_routes import router as exam_router
from app.routes.live_alert_routes import router as live_alert_router
from app.routes.violation_routes import router as violation_router
from app.routes.student_routes import router as student_router
from app.services.pipeline import analyze_frame

# Import model modules so SQLAlchemy registers all tables before create_all runs.
from app.models import exam as _exam_model  # noqa: F401
from app.models import user as _user_model  # noqa: F401

# Create FastAPI app
app = FastAPI(title="AI Proctoring System")

# Create DB tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth_router, prefix="/auth")
app.include_router(exam_router)
app.include_router(live_alert_router)
app.include_router(violation_router)
app.include_router(student_router)

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
    return {"message": "Server running"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    exam_id: int = 0,
    user=Depends(get_current_user),
):
    image_bytes = await file.read()
    result = analyze_frame(image_bytes)

    violations = result.get("violations")
    if violations:
        db = SessionLocal()
        try:
            if isinstance(violations, str):
                violations = [violations]

            for violation_name in violations:
                violation = Violation(
                    student_id=user["user_id"],
                    exam_id=exam_id,
                    violation_type=violation_name,
                )
                db.add(violation)

            db.commit()
            for violation_name in violations:
                await alert_manager.broadcast(
                    exam_id,
                    {
                        "exam_id": exam_id,
                        "student_id": user["user_id"],
                        "violation_type": violation_name,
                        "message": f"Violation detected: {violation_name}",
                    },
                )
        finally:
            db.close()

    return result

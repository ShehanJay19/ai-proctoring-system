from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.exam import Exam, Question

router = APIRouter()

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE EXAM
# =========================
@router.post("/exam/create")
def create_exam(title: str, teacher_id: int, db: Session = Depends(get_db)):
    exam = Exam(title=title, teacher_id=teacher_id)

    db.add(exam)
    db.commit()
    db.refresh(exam)

    return {"exam_id": exam.id, "title": exam.title}


# =========================
# ADD QUESTION
# =========================
@router.post("/question/add")
def add_question(
    exam_id: int,
    question_text: str,
    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,
    correct_answer: str,
    db: Session = Depends(get_db)
):
    question = Question(
        exam_id=exam_id,
        question_text=question_text,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_answer=correct_answer
    )

    db.add(question)
    db.commit()

    return {"message": "Question added"}
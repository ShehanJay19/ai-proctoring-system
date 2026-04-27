from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.routes import get_db
from app.models.user import User
from app.auth.auth import hash_password

router = APIRouter()


def _student_response(student: User) -> dict:
    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "role": student.role,
    }


@router.get("/students")
def list_students(db: Session = Depends(get_db)):
    students = db.query(User).filter(User.role == "student").all()
    return {
        "count": len(students),
        "students": [_student_response(student) for student in students],
    }


@router.get("/students/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = (
        db.query(User)
        .filter(User.id == student_id, User.role == "student")
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return _student_response(student)


@router.put("/students/{student_id}")
def update_student(
    student_id: int,
    name: str | None = None,
    email: str | None = None,
    password: str | None = None,
    db: Session = Depends(get_db),
):
    student = (
        db.query(User)
        .filter(User.id == student_id, User.role == "student")
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if name is not None:
        student.name = name
    if email is not None:
        student.email = email
    if password is not None:
        student.password = hash_password(password)

    try:
        db.commit()
        db.refresh(student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

    return {
        "message": "Student updated",
        "student": _student_response(student),
    }


@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = (
        db.query(User)
        .filter(User.id == student_id, User.role == "student")
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()

    return {"message": "Student deleted"}

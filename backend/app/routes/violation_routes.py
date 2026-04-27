from collections import OrderedDict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.routes import get_db
from app.models.user import User
from app.models.violation import Violation

router = APIRouter()


@router.get("/violations/{exam_id}")
def get_exam_violations(
    exam_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required")

    violations = (
        db.query(Violation)
        .filter(Violation.exam_id == exam_id)
        .order_by(Violation.student_id, Violation.id)
        .all()
    )

    grouped = OrderedDict()
    for violation in violations:
        student = db.query(User).filter(User.id == violation.student_id).first()
        student_key = violation.student_id

        if student_key not in grouped:
            grouped[student_key] = {
                "student_id": violation.student_id,
                "name": student.name if student else None,
                "email": student.email if student else None,
                "violation_count": 0,
                "violations": [],
            }

        grouped[student_key]["violation_count"] += 1
        grouped[student_key]["violations"].append(
            {
                "id": violation.id,
                "violation_type": violation.violation_type,
            }
        )

    return {
        "exam_id": exam_id,
        "total_violations": len(violations),
        "students": list(grouped.values()),
    }
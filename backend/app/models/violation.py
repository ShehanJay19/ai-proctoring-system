from sqlalchemy import Column, Integer, String
from app.database.db import Base

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer)
    exam_id = Column(Integer)

    # type of violation (phone, multiple faces, etc.)
    violation_type = Column(String)
from fastapi import APIRouter
from pydantic import BaseModel

from backend.lessons.alerts import generate_alert


router = APIRouter(
    prefix="/api/lessons",
    tags=["Lessons Learned"]
)


class LessonRequest(BaseModel):
    query: str



@router.post("/analyze")
def analyze_lesson(
    request: LessonRequest
):

    result = generate_alert(
        request.query
    )

    return result
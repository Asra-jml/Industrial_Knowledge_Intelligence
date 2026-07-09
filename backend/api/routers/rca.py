from fastapi import APIRouter
from pydantic import BaseModel

from backend.rca.rca_agent import RCAAgent

router = APIRouter(prefix="/api/rca", tags=["RCA"])


class RCARequest(BaseModel):
    equipment: str
    fault: str


@router.post("/analyze")
def analyze(request: RCARequest):
    agent = RCAAgent()
    return agent.analyze(
        request.equipment,
        request.fault
    )
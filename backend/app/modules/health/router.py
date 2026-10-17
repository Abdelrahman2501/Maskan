"""GET /api/v1/health — liveness + database connectivity (PLAT-002)."""

import logging
from typing import Literal

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import Engine, text
from sqlalchemy.exc import SQLAlchemyError

from app import __version__
from app.core.config import Settings, get_settings
from app.db.session import get_engine

logger = logging.getLogger(__name__)

router = APIRouter(tags=["platform"])


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    database: Literal["ok", "unavailable"]
    version: str
    environment: str


@router.get(
    "/health",
    response_model=HealthResponse,
    responses={503: {"model": HealthResponse}},
    summary="Service health",
)
def health(
    response: Response,
    engine: Engine = Depends(get_engine),
    settings: Settings = Depends(get_settings),
) -> HealthResponse:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        database: Literal["ok", "unavailable"] = "ok"
    except SQLAlchemyError:
        logger.warning("Health check: database unavailable")
        database = "unavailable"

    healthy = database == "ok"
    if not healthy:
        response.status_code = 503
    return HealthResponse(
        status="ok" if healthy else "degraded",
        database=database,
        version=__version__,
        environment=settings.environment,
    )

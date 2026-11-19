from typing import Any
from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from app.core.cache import cache
from app.db.session import engine

router = APIRouter()


@router.get("/health", tags=["health"])
def health() -> dict[str, Any]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database is unavailable") from exc
    return {
        "status": "ok",
        "database": "connected",
        "cache": cache.get_info(),
    }


@router.get("/health/cache", tags=["health"])
def health_cache() -> dict[str, Any]:
    return cache.get_info()

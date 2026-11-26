from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import auth, feed, groups, health, members, messages, notifications, shop

app = FastAPI(title="Group Chat API", version="0.1.0")

cors_regex = r".*" if settings.allow_all_origins else r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
origins_list = [] if settings.allow_all_origins else settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_origin_regex=cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
(UPLOAD_DIR / "avatars").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "messages").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "groups").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "posts").mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(members.router, prefix="/api/groups", tags=["members"])
app.include_router(messages.router, prefix="/api/groups", tags=["messages"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(feed.router, prefix="/api", tags=["feed"])
app.include_router(shop.router, prefix="/api/shop", tags=["shop"])

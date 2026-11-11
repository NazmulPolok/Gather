from datetime import datetime, timezone
from pathlib import Path
import secrets
import time
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.message import Message
from app.models.membership import Membership
from app.models.notification import Notification
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, TypingStatusRequest, TypingUserResponse
from app.services.permissions import active_membership

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
MESSAGES_DIR = UPLOAD_DIR / "messages"
MESSAGES_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_FILE_SIZE = 10 * 1024 * 1024

# In-memory typing tracker: {group_id: {user_id: {"user_id": int, "name": str, "avatar_url": str | None, "is_anonymous": bool, "expires_at": float}}}
typing_store: dict[int, dict[int, dict]] = {}
TYPING_TTL_SECONDS = 4.0


def _display_name(user: User) -> str:
    return user.nickname or " ".join(part for part in (user.first_name, user.last_name) if part).strip() or user.username


@router.get("/{group_id}/messages", response_model=list[MessageResponse])
def list_messages(
    group_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    before_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MessageResponse]:
    active_membership(db, group_id, user.id)
    query = select(Message).where(Message.group_id == group_id)
    if before_id is not None:
        query = query.where(Message.id < before_id)
    query = query.order_by(Message.id.desc()).limit(limit)
    messages = list(db.scalars(query).all())
    messages.reverse()

    memberships = db.scalars(
        select(Membership).where(
            Membership.group_id == group_id,
            Membership.nickname.isnot(None),
        )
    ).all()
    nicknames = {m.user_id: m.nickname for m in memberships if m.nickname}

    response_items: list[MessageResponse] = []
    for message in messages:
        is_anon = message.is_anonymous
        is_own = (message.sender_id == user.id)
        if is_anon:
            sender_id = message.sender_id if is_own else 0
            sender_name = "Anonymous"
            sender_username = "anonymous"
            sender_avatar_url = None
        else:
            sender_id = message.sender_id
            sender_name = nicknames.get(message.sender_id) or _display_name(message.sender)
            sender_username = message.sender.username
            sender_avatar_url = message.sender.avatar_url
        response_items.append(
            MessageResponse(
                id=message.id,
                group_id=message.group_id,
                sender_id=sender_id,
                sender_name=sender_name,
                sender_username=sender_username,
                sender_avatar_url=sender_avatar_url,
                message_type=message.message_type,
                body=message.body,
                image_url=message.image_url,
                is_anonymous=is_anon,
                created_at=message.created_at,
            )
        )
    return response_items


@router.post("/{group_id}/upload-image")
async def upload_group_image(
    group_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    active_membership(db, group_id, user.id)
    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.",
        )
    ext = ALLOWED_IMAGE_TYPES[content_type]
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size too large. Maximum size is 10MB.",
        )
    filename = f"{secrets.token_hex(16)}{ext}"
    dest = MESSAGES_DIR / filename
    dest.write_bytes(contents)

    return {"image_url": f"/uploads/messages/{filename}"}


@router.post("/{group_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    group_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MessageResponse:
    membership = active_membership(db, group_id, user.id)

    # Clear typing indicator for this user when message is posted
    if group_id in typing_store:
        typing_store[group_id].pop(user.id, None)

    now_dt = datetime.now(timezone.utc)
    user.last_seen_at = now_dt

    message = Message(
        group_id=group_id,
        sender_id=user.id,
        message_type=payload.message_type,
        body=payload.body,
        image_url=payload.image_url,
        is_anonymous=payload.is_anonymous,
    )
    db.add(message)
    db.flush()
    recipient_ids = db.scalars(
        select(Membership.user_id).where(
            Membership.group_id == group_id,
            Membership.status == "active",
            Membership.user_id != user.id,
        )
    ).all()
    db.add_all(
        [
            Notification(
                user_id=recipient_id,
                group_id=group_id,
                actor_id=user.id,
                message_id=message.id,
                notification_type="message",
            )
            for recipient_id in recipient_ids
        ]
    )
    db.commit()
    db.refresh(message)
    is_anon = message.is_anonymous
    sender_name = "Anonymous" if is_anon else (membership.nickname or _display_name(user))
    sender_avatar = None if is_anon else user.avatar_url
    return MessageResponse(
        id=message.id,
        group_id=group_id,
        sender_id=user.id,
        sender_name=sender_name,
        sender_username="anonymous" if is_anon else user.username,
        sender_avatar_url=sender_avatar,
        message_type=message.message_type,
        body=message.body,
        image_url=message.image_url,
        is_anonymous=is_anon,
        created_at=message.created_at,
    )


@router.post("/{group_id}/typing")
def update_typing_status(
    group_id: int,
    payload: TypingStatusRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    membership = active_membership(db, group_id, user.id)
    now_dt = datetime.now(timezone.utc)
    user.last_seen_at = now_dt
    db.commit()

    now_ts = time.time()
    group_typers = typing_store.setdefault(group_id, {})

    if payload.is_typing:
        display_name = "Anonymous" if payload.is_anonymous else (membership.nickname or _display_name(user))
        avatar = None if payload.is_anonymous else user.avatar_url
        group_typers[user.id] = {
            "user_id": user.id,
            "name": display_name,
            "avatar_url": avatar,
            "is_anonymous": payload.is_anonymous,
            "expires_at": now_ts + TYPING_TTL_SECONDS,
        }
    else:
        group_typers.pop(user.id, None)

    return {"status": "ok"}


@router.get("/{group_id}/typing", response_model=list[TypingUserResponse])
def get_typing_users(
    group_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[TypingUserResponse]:
    active_membership(db, group_id, user.id)
    now_ts = time.time()
    group_typers = typing_store.get(group_id, {})

    # Prune expired entries
    expired_ids = [uid for uid, info in group_typers.items() if info["expires_at"] <= now_ts]
    for uid in expired_ids:
        group_typers.pop(uid, None)

    active_list: list[TypingUserResponse] = []
    for uid, info in group_typers.items():
        if uid != user.id:
            active_list.append(
                TypingUserResponse(
                    user_id=info["user_id"] if not info["is_anonymous"] else 0,
                    name=info["name"],
                    avatar_url=info["avatar_url"],
                    is_anonymous=info["is_anonymous"],
                )
            )
    return active_list

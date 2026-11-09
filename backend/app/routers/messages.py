from pathlib import Path
import secrets
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.message import Message
from app.models.membership import Membership
from app.models.notification import Notification
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
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


def _display_name(user: User) -> str:
    return user.nickname or " ".join(part for part in (user.first_name, user.last_name) if part).strip() or user.username

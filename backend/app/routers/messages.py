from datetime import datetime, timezone
from pathlib import Path
import secrets
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import ALGORITHM
from app.core.ws_manager import manager
from app.db.session import SessionLocal, get_db
from app.models.message import Message
from app.models.membership import Membership
from app.models.notification import Notification
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, SeenUser
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


def _to_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _compute_message_statuses(
    db: Session,
    group_id: int,
    messages: list[Message],
    current_user_id: int,
) -> dict[int, tuple[str, list[SeenUser]]]:
    if not messages:
        return {}

    msg_ids = [m.id for m in messages]

    # Fetch all read notifications for these messages
    read_notifications = db.execute(
        select(
            Notification.message_id,
            Notification.user_id,
            Notification.read_at,
            User.first_name,
            User.last_name,
            User.username,
            User.avatar_url,
            Membership.nickname,
        )
        .join(User, User.id == Notification.user_id)
        .outerjoin(
            Membership,
            (Membership.user_id == Notification.user_id) & (Membership.group_id == group_id),
        )
        .where(
            Notification.message_id.in_(msg_ids),
            Notification.read_at.isnot(None),
        )
    ).all()

    seen_map: dict[int, list[SeenUser]] = {}
    for row in read_notifications:
        name = row.nickname or " ".join(p for p in (row.first_name, row.last_name) if p).strip() or row.username
        seen_map.setdefault(row.message_id, []).append(
            SeenUser(
                user_id=row.user_id,
                name=name,
                username=row.username,
                avatar_url=row.avatar_url,
                read_at=_to_utc(row.read_at),
            )
        )

    # Fetch other active members of this group
    other_members = db.scalars(
        select(User)
        .join(Membership, Membership.user_id == User.id)
        .where(
            Membership.group_id == group_id,
            Membership.status == "active",
            Membership.user_id != current_user_id,
        )
    ).all()

    online_ws_ids = set()
    try:
        online_ws_ids = set(manager.get_online_user_ids_in_group(group_id))
    except Exception:
        pass

    now = datetime.now(timezone.utc)
    has_online_other_member = any(
        m.id in online_ws_ids or (
            m.last_seen_at and ((now - _to_utc(m.last_seen_at)).total_seconds() < 45)
        )
        for m in other_members
    )

    result = {}
    for m in messages:
        seen_users = seen_map.get(m.id, [])
        if seen_users:
            result[m.id] = ("seen", seen_users)
            continue

        if not other_members:
            result[m.id] = ("sent", [])
            continue

        if has_online_other_member:
            result[m.id] = ("delivered", [])
            continue

        m_created = _to_utc(m.created_at)
        was_delivered = any(
            m_user.last_seen_at and (_to_utc(m_user.last_seen_at) >= m_created)
            for m_user in other_members
        )

        if was_delivered:
            result[m.id] = ("delivered", [])
        else:
            result[m.id] = ("sent", [])

    return result


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

    status_map = _compute_message_statuses(db, group_id, messages, user.id)

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

        msg_status, seen_users = status_map.get(message.id, ("sent", []))

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
                status=msg_status,
                seen_by=seen_users,
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
async def create_message(
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

    status_map = _compute_message_statuses(db, group_id, [message], user.id)
    msg_status, seen_users = status_map.get(message.id, ("sent", []))

    response = MessageResponse(
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
        status=msg_status,
        seen_by=seen_users,
    )

    # Broadcast new message and clear typing status
    msg_dict = {
        "id": response.id,
        "group_id": group_id,
        "sender_id": response.sender_id,
        "sender_name": response.sender_name,
        "sender_username": response.sender_username,
        "sender_avatar_url": response.sender_avatar_url,
        "message_type": response.message_type,
        "body": response.body,
        "image_url": response.image_url,
        "is_anonymous": response.is_anonymous,
        "created_at": response.created_at.isoformat() if response.created_at else "",
        "status": msg_status,
        "seen_by": [s.model_dump() if hasattr(s, "model_dump") else s for s in seen_users],
    }
    await manager.broadcast_to_group(group_id, {
        "type": "new_message",
        "message": msg_dict,
    })
    await manager.broadcast_to_group(group_id, {
        "type": "typing",
        "user_id": user.id if not is_anon else 0,
        "is_typing": False,
    })

    return response


def _get_user_from_token(token: str, db: Session) -> User | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    return db.get(User, user_id)


@router.websocket("/{group_id}/ws")
async def group_websocket(
    websocket: WebSocket,
    group_id: int,
    token: str = Query(...),
):
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        user = _get_user_from_token(token, db)
        if user is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        try:
            active_membership(db, group_id, user.id)
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        user.last_seen_at = now
        db.commit()

        membership = db.scalar(
            select(Membership).where(
                Membership.group_id == group_id,
                Membership.user_id == user.id,
            )
        )
        display_name = (membership.nickname if membership and membership.nickname else None) or _display_name(user)
        user_info = {
            "user_id": user.id,
            "username": user.username,
            "name": display_name,
            "avatar_url": user.avatar_url,
        }

    await manager.connect(websocket, group_id, user_info)

    # Send current online users in this group to the connecting client
    await websocket.send_json({
        "type": "presence_state",
        "online_user_ids": manager.get_online_user_ids_in_group(group_id),
    })

    # Broadcast to other members that this user is now online
    await manager.broadcast_to_group(
        group_id,
        {
            "type": "presence",
            "user_id": user_info["user_id"],
            "is_online": True,
        },
        exclude=websocket,
    )

    # Broadcast to other members that their messages are delivered to this user
    await manager.broadcast_to_group(
        group_id,
        {
            "type": "messages_delivered",
            "user_id": user_info["user_id"],
        },
        exclude=websocket,
    )

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            if event_type == "typing":
                is_typing = bool(data.get("is_typing", False))
                is_anon = bool(data.get("is_anonymous", False))
                if is_anon:
                    typing_name = "Anonymous"
                    typing_user_id = 0
                    typing_avatar = None
                else:
                    typing_name = user_info["name"]
                    typing_user_id = user_info["user_id"]
                    typing_avatar = user_info["avatar_url"]

                await manager.broadcast_to_group(
                    group_id,
                    {
                        "type": "typing",
                        "user_id": typing_user_id,
                        "name": typing_name,
                        "avatar_url": typing_avatar,
                        "is_typing": is_typing,
                        "is_anonymous": is_anon,
                    },
                    exclude=websocket,
                )
            elif event_type == "mark_read":
                read_now = datetime.now(timezone.utc)
                with SessionLocal() as db_read:
                    db_read.execute(
                        update(Notification)
                        .where(
                            Notification.user_id == user_info["user_id"],
                            Notification.group_id == group_id,
                            Notification.notification_type == "message",
                            Notification.read_at.is_(None),
                        )
                        .values(read_at=read_now)
                    )
                    db_read.commit()
                await manager.broadcast_to_group(
                    group_id,
                    {
                        "type": "messages_read",
                        "user_id": user_info["user_id"],
                        "name": user_info["name"],
                        "username": user_info["username"],
                        "avatar_url": user_info["avatar_url"],
                        "read_at": read_now.isoformat(),
                    },
                    exclude=websocket,
                )
    except WebSocketDisconnect:
        _, is_completely_offline = manager.disconnect(websocket, group_id)
        disconnect_now = datetime.now(timezone.utc)
        if is_completely_offline:
            try:
                with SessionLocal() as db:
                    u = db.get(User, user_info["user_id"])
                    if u:
                        u.last_seen_at = disconnect_now
                        db.commit()
            except Exception:
                pass

        await manager.broadcast_to_group(
            group_id,
            {
                "type": "typing",
                "user_id": user_info["user_id"],
                "is_typing": False,
            },
        )
        await manager.broadcast_to_group(
            group_id,
            {
                "type": "presence",
                "user_id": user_info["user_id"],
                "is_online": not is_completely_offline,
                "last_seen_at": disconnect_now.isoformat(),
            },
        )
    except Exception:
        manager.disconnect(websocket, group_id)


def _display_name(user: User) -> str:
    return user.nickname or " ".join(part for part in (user.first_name, user.last_name) if part).strip() or user.username

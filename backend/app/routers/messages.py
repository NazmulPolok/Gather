from fastapi import APIRouter, Depends, Query, status
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


@router.get("/{group_id}/messages", response_model=list[MessageResponse])
def list_messages(
    group_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    before_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Message]:
    active_membership(db, group_id, user.id)
    query = select(Message).where(Message.group_id == group_id)
    if before_id is not None:
        query = query.where(Message.id < before_id)
    query = query.order_by(Message.id.desc()).limit(limit)
    messages = list(db.scalars(query).all())
    messages.reverse()
    return [MessageResponse(id=message.id, group_id=message.group_id, sender_id=message.sender_id, sender_name=_display_name(message.sender), sender_username=message.sender.username, message_type=message.message_type, body=message.body, created_at=message.created_at) for message in messages]


@router.post("/{group_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    group_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Message:
    active_membership(db, group_id, user.id)
    message = Message(group_id=group_id, sender_id=user.id, message_type="text", body=payload.body)
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
    return MessageResponse(id=message.id, group_id=group_id, sender_id=user.id, sender_name=_display_name(user), sender_username=user.username, message_type="text", body=message.body, created_at=message.created_at)


def _display_name(user: User) -> str:
    return " ".join(part for part in (user.first_name, user.last_name) if part).strip() or user.username

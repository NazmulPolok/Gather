from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session, aliased

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.group import Group
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import JoinRequestResponse, NotificationFeed, NotificationItem
from app.models.membership import Membership
from app.services.permissions import admin_membership

router = APIRouter()


@router.get("", response_model=NotificationFeed)
def list_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> NotificationFeed:
    actor = aliased(User)
    rows = db.execute(
        select(Notification, Group.name, actor.first_name, actor.last_name, actor.username)
        .join(Group, Group.id == Notification.group_id)
        .join(actor, actor.id == Notification.actor_id)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(limit)
    ).all()
    unread_count = db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == user.id,
            Notification.read_at.is_(None),
        )
    ) or 0
    items = [
        NotificationItem(
            id=notification.id,
            group_id=notification.group_id,
            group_name=group_name,
            actor_id=notification.actor_id,
            actor_name=" ".join(part for part in (first_name, last_name) if part).strip() or username,
            actor_username=username,
            notification_type=notification.notification_type,
            resolution=notification.resolution,
            message_id=notification.message_id,
            read_at=notification.read_at,
            created_at=notification.created_at,
        )
        for notification, group_name, first_name, last_name, username in rows
    ]
    return NotificationFeed(items=items, unread_count=unread_count)


@router.post("/{notification_id}/respond", response_model=dict[str, str])
def respond_to_join_request(
    notification_id: int,
    payload: JoinRequestResponse,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user.id,
            Notification.notification_type == "join_request",
        )
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Join request notification not found")
    admin_membership(db, notification.group_id, user.id)
    if notification.resolution is not None:
        return {"status": notification.resolution}

    membership = db.scalar(
        select(Membership).where(
            Membership.group_id == notification.group_id,
            Membership.user_id == notification.actor_id,
            Membership.status == "pending",
        )
    )
    if membership is None:
        raise HTTPException(status_code=409, detail="This join request is no longer pending")

    resolution = "accepted" if payload.action == "accept" else "declined"
    membership.status = "active" if payload.action == "accept" else "rejected"
    db.execute(
        update(Notification)
        .where(
            Notification.group_id == notification.group_id,
            Notification.actor_id == notification.actor_id,
            Notification.notification_type == "join_request",
            Notification.resolution.is_(None),
        )
        .values(resolution=resolution, read_at=datetime.now(timezone.utc))
    )
    db.commit()
    return {"status": resolution}


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        .values(read_at=datetime.now(timezone.utc))
    )
    db.commit()
    return {"status": "read"}


@router.patch("/groups/{group_id}/read")
def mark_group_messages_read(
    group_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    db.execute(
        update(Notification)
        .where(
            Notification.user_id == user.id,
            Notification.group_id == group_id,
            Notification.notification_type == "message",
            Notification.read_at.is_(None),
        )
        .values(read_at=datetime.now(timezone.utc))
    )
    db.commit()
    return {"status": "read"}


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    notification = db.scalar(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
        db.commit()
    return {"status": "read"}

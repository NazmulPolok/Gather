from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from sqlalchemy import case, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.group import Group
from app.models.membership import Membership
from app.models.notification import Notification
from app.models.user import User
from app.services.permissions import active_membership, admin_membership

router = APIRouter()


class NicknameUpdate(BaseModel):
    nickname: str | None = Field(default=None, max_length=64)


@router.post("/join/{invite_code}")
def join_group(invite_code: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict[str, str]:
    if len(invite_code) != 8 or not invite_code.isalnum():
        raise HTTPException(status_code=404, detail="Group not found")
    group = db.scalar(select(Group).where(Group.invite_code == invite_code.upper()))
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    group_id = group.id

    membership = db.scalar(
        select(Membership).where(Membership.group_id == group_id, Membership.user_id == user.id)
    )
    state = "active" if group.join_policy == "open" else "pending"
    if membership is not None:
        if membership.status == "active" or membership.status == "pending":
            return {"status": membership.status}
        membership.status = state
    else:
        db.add(Membership(group_id=group_id, user_id=user.id, role="member", status=state))
    if state == "pending":
        admin_ids = db.scalars(
            select(Membership.user_id).where(
                Membership.group_id == group_id,
                Membership.role == "admin",
                Membership.status == "active",
            )
        ).all()
        for admin_id in admin_ids:
            if admin_id != user.id:
                db.add(
                    Notification(
                        user_id=admin_id,
                        group_id=group_id,
                        actor_id=user.id,
                        notification_type="join_request",
                    )
                )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        existing = db.scalar(
            select(Membership).where(Membership.group_id == group_id, Membership.user_id == user.id)
        )
        if existing is not None:
            return {"status": existing.status}
        raise HTTPException(status_code=409, detail="Could not join group") from exc
    return {"status": state}


@router.get("/{group_id}/members")
def list_members(
    group_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict[str, object]]:
    requester = active_membership(db, group_id, user.id)
    query = select(Membership, User).join(User).where(Membership.group_id == group_id)
    if requester.role != "admin":
        query = query.where(Membership.status == "active")
    query = query.order_by(Membership.status, User.email)
    rows = db.execute(query).all()
    return [
        {
            "user_id": membership.user_id,
            "email": member.email,
            "first_name": member.first_name,
            "last_name": member.last_name,
            "username": member.username,
            "role": membership.role,
            "status": membership.status,
            "nickname": membership.nickname,
        }
        for membership, member in rows
    ]


@router.patch("/{group_id}/members/{target_user_id}/nickname")
def update_member_nickname(
    group_id: int,
    target_user_id: int,
    payload: NicknameUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    active_membership(db, group_id, user.id)
    target = db.scalar(
        select(Membership).where(
            Membership.group_id == group_id,
            Membership.user_id == target_user_id,
            Membership.status == "active",
        )
    )
    if target is None:
        raise HTTPException(status_code=404, detail="Active group member not found")

    clean_nick = payload.nickname.strip() if payload.nickname and payload.nickname.strip() else None
    target.nickname = clean_nick
    db.commit()
    return {"status": "ok", "user_id": target_user_id, "nickname": clean_nick}


@router.post("/{group_id}/members/{user_id}/approve")
def approve_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    admin_membership(db, group_id, user.id)
    pending = db.scalar(
        select(Membership).where(
            Membership.group_id == group_id,
            Membership.user_id == user_id,
            Membership.status == "pending",
        )
    )
    if pending is None:
        raise HTTPException(status_code=404, detail="Pending member not found")
    pending.status = "active"
    _resolve_join_requests(db, group_id, user_id, "accepted")
    db.commit()
    return {"status": "active"}


@router.delete("/{group_id}/leave")
def leave_group(
    group_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    membership = db.scalar(
        select(Membership).where(
            Membership.group_id == group_id,
            Membership.user_id == user.id,
            Membership.status == "active",
        )
    )
    if membership is None:
        raise HTTPException(status_code=404, detail="Active group membership not found")

    group = db.get(Group, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    if membership.role == "admin" or group.owner_id == user.id:
        successor = db.scalar(
            select(Membership)
            .where(
                Membership.group_id == group_id,
                Membership.user_id != user.id,
                Membership.status == "active",
            )
            .order_by(case((Membership.role == "admin", 0), else_=1), Membership.id)
        )
        if successor is None:
            # The departing user is the last active member, so the empty group has no future admin.
            db.delete(group)
            db.commit()
            return {"status": "group_deleted"}
        successor.role = "admin"
        group.owner_id = successor.user_id

    db.delete(membership)
    db.commit()
    return {"status": "left"}


@router.delete("/{group_id}/members/{target_user_id}")
def remove_member(
    group_id: int,
    target_user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    admin_membership(db, group_id, user.id)
    if target_user_id == user.id:
        raise HTTPException(status_code=400, detail="Use the leave group action to remove yourself")

    target = db.scalar(
        select(Membership).where(
            Membership.group_id == group_id,
            Membership.user_id == target_user_id,
        )
    )
    if target is None:
        raise HTTPException(status_code=404, detail="Group member not found")

    if target.status == "pending":
        _resolve_join_requests(db, group_id, target_user_id, "declined")

    group = db.get(Group, group_id)
    if group is not None and group.owner_id == target_user_id:
        group.owner_id = user.id
    db.delete(target)
    db.commit()
    return {"status": "removed"}


def _resolve_join_requests(db: Session, group_id: int, actor_id: int, resolution: str) -> None:
    notifications = db.scalars(
        select(Notification).where(
            Notification.group_id == group_id,
            Notification.actor_id == actor_id,
            Notification.notification_type == "join_request",
            Notification.resolution.is_(None),
        )
    ).all()
    for notification in notifications:
        notification.resolution = resolution
        notification.read_at = datetime.now(timezone.utc)

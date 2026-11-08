from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.membership import Membership


def active_membership(db: Session, group_id: int, user_id: int) -> Membership:
    membership = db.scalar(
        select(Membership).where(
            Membership.group_id == group_id,
            Membership.user_id == user_id,
            Membership.status == "active",
        )
    )
    if membership is None:
        raise HTTPException(status_code=403, detail="Active group membership required")
    return membership


def admin_membership(db: Session, group_id: int, user_id: int) -> Membership:
    from app.models.group import Group
    membership = active_membership(db, group_id, user_id)
    group = db.get(Group, group_id)
    if membership.role != "admin" and (group is None or group.owner_id != user_id):
        raise HTTPException(status_code=403, detail="Group admin required")
    return membership

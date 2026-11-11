from pathlib import Path
import secrets
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.group import Group
from app.models.membership import Membership
from app.models.user import User
from app.schemas.group import GroupCreate, GroupResponse, GroupUpdate
from app.services.permissions import active_membership, admin_membership

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
GROUPS_DIR = UPLOAD_DIR / "groups"
GROUPS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(payload: GroupCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Group:
    group = Group(name=payload.name, invite_code=secrets.token_hex(4).upper(), owner_id=user.id, join_policy=payload.join_policy)
    db.add(group)
    db.flush()
    db.add(Membership(group_id=group.id, user_id=user.id, role="admin", status="active"))
    db.commit()
    db.refresh(group)
    return group


@router.get("", response_model=list[GroupResponse])
def list_groups(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[Group]:
    query = (
        select(Group)
        .join(Membership)
        .where(Membership.user_id == user.id, Membership.status == "active")
        .order_by(Group.created_at.desc())
    )
    return list(db.scalars(query).all())


@router.get("/{group_id}", response_model=GroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Group:
    active_membership(db, group_id, user.id)
    group = db.get(Group, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.patch("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    payload: GroupUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Group:
    admin_membership(db, group_id, user.id)
    group = db.get(Group, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


@router.post("/{group_id}/avatar", response_model=GroupResponse)
async def upload_group_avatar(
    group_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Group:
    admin_membership(db, group_id, user.id)
    group = db.get(Group, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

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
    dest = GROUPS_DIR / filename
    dest.write_bytes(contents)

    group.avatar_url = f"/uploads/groups/{filename}"
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}/avatar", response_model=GroupResponse)
def delete_group_avatar(
    group_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Group:
    admin_membership(db, group_id, user.id)
    group = db.get(Group, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    group.avatar_url = None
    db.commit()
    db.refresh(group)
    return group


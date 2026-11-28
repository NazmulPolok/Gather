from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.post import Post, PostComment, PostReaction
from app.models.settings import PostInteraction, SavedPost, UserSession, UserSettings
from app.models.user import User
from app.schemas.settings import (
    UserSessionResponse,
    UserSettingsResponse,
    UserSettingsUpdate,
)

router = APIRouter()


@router.get("/settings", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = db.scalar(select(UserSettings).where(UserSettings.user_id == current_user.id))
    if not settings:
        settings = UserSettings(
            user_id=current_user.id,
            who_can_see_posts="public",
            who_can_comment="public",
            who_can_tag="everyone",
            who_can_send_friend_requests="everyone",
            who_can_see_friends_list="public",
            post_notifications_enabled=True,
            sound_enabled=True,
            language="en",
            font_size="standard",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.patch("/settings", response_model=UserSettingsResponse)
def update_user_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = db.scalar(select(UserSettings).where(UserSettings.user_id == current_user.id))
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(settings, field, val)
    settings.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(settings)
    return settings


@router.get("/sessions", response_model=list[UserSessionResponse])
def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = db.scalars(
        select(UserSession)
        .where(UserSession.user_id == current_user.id)
        .order_by(desc(UserSession.is_current), desc(UserSession.last_active_at))
    ).all()

    # If no sessions recorded yet, seed current active session and a trusted desktop/mobile session
    if not sessions:
        now = datetime.now(timezone.utc)
        curr = UserSession(
            id=f"sess_{uuid.uuid4().hex[:12]}",
            user_id=current_user.id,
            device="Windows PC",
            browser="Chrome 131.0 (Windows NT 10.0)",
            ip_address="127.0.0.1",
            location="Dhaka, Bangladesh",
            is_current=True,
            last_active_at=now,
            created_at=now,
        )
        mobile = UserSession(
            id=f"sess_{uuid.uuid4().hex[:12]}",
            user_id=current_user.id,
            device="Apple iPhone 15 Pro",
            browser="Safari Mobile 18.1",
            ip_address="103.145.118.24",
            location="Dhaka, Bangladesh",
            is_current=False,
            last_active_at=now,
            created_at=now,
        )
        db.add_all([curr, mobile])
        db.commit()
        sessions = [curr, mobile]

    return sessions


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def terminate_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.scalar(
        select(UserSession).where(
            UserSession.id == session_id,
            UserSession.user_id == current_user.id,
        )
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.is_current:
        raise HTTPException(status_code=400, detail="Cannot terminate current active session here")

    db.delete(session)
    db.commit()


@router.post("/sessions/logout-others", status_code=status.HTTP_200_OK)
def logout_other_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    other_sessions = db.scalars(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_current.is_(False),
        )
    ).all()
    for s in other_sessions:
        db.delete(s)
    db.commit()
    return {"message": "All other sessions logged out successfully"}


@router.get("/activity-log")
def get_activity_log(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Retrieve user's posts, reactions, and comments
    recent_posts = db.scalars(
        select(Post)
        .where(Post.author_id == current_user.id)
        .order_by(desc(Post.created_at))
        .limit(10)
    ).all()

    recent_comments = db.scalars(
        select(PostComment)
        .where(PostComment.author_id == current_user.id)
        .order_by(desc(PostComment.created_at))
        .limit(10)
    ).all()

    recent_reactions = db.scalars(
        select(PostReaction)
        .where(PostReaction.user_id == current_user.id)
        .order_by(desc(PostReaction.created_at))
        .limit(10)
    ).all()

    items = []
    for p in recent_posts:
        items.append({
            "id": f"post_{p.id}",
            "type": "post",
            "action": f"Published post: \"{p.title[:40]}\"",
            "timestamp": p.created_at.isoformat(),
            "target_id": p.id,
        })
    for c in recent_comments:
        items.append({
            "id": f"comment_{c.id}",
            "type": "comment",
            "action": f"Commented: \"{c.content[:40]}\"",
            "timestamp": c.created_at.isoformat(),
            "target_id": c.post_id,
        })
    for r in recent_reactions:
        items.append({
            "id": f"reaction_{r.id}",
            "type": "reaction",
            "action": f"Reacted with {r.reaction_type} on a post",
            "timestamp": r.created_at.isoformat(),
            "target_id": r.post_id,
        })

    items.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"activities": items[:25]}

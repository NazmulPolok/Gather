from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    who_can_see_posts: Mapped[str] = mapped_column(String(32), default="public", server_default="public", nullable=False)
    who_can_comment: Mapped[str] = mapped_column(String(32), default="public", server_default="public", nullable=False)
    who_can_tag: Mapped[str] = mapped_column(String(32), default="everyone", server_default="everyone", nullable=False)
    who_can_send_friend_requests: Mapped[str] = mapped_column(String(32), default="everyone", server_default="everyone", nullable=False)
    who_can_see_friends_list: Mapped[str] = mapped_column(String(32), default="public", server_default="public", nullable=False)
    post_notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    language: Mapped[str] = mapped_column(String(16), default="en", server_default="en", nullable=False)
    font_size: Mapped[str] = mapped_column(String(16), default="standard", server_default="standard", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped["User"] = relationship()


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device: Mapped[str] = mapped_column(String(128), nullable=False)
    browser: Mapped[str] = mapped_column(String(128), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    location: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    last_active_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship()


class SavedPost(Base):
    __tablename__ = "saved_posts"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_saved_post"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    collection_name: Mapped[str] = mapped_column(String(64), default="Favorites", server_default="Favorites", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship()
    post: Mapped["Post"] = relationship()


class PostInteraction(Base):
    __tablename__ = "post_interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[int | None] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    target_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(32), nullable=False)  # hide, snooze, report, notify
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    post: Mapped["Post"] = relationship(foreign_keys=[post_id])
    target_user: Mapped["User"] = relationship(foreign_keys=[target_user_id])

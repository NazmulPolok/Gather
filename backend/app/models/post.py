from datetime import datetime
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        CheckConstraint(
            "content IS NOT NULL OR image_url IS NOT NULL",
            name="ck_posts_content_or_image",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    group: Mapped["Group"] = relationship()
    author: Mapped["User"] = relationship()
    reactions: Mapped[list["PostReaction"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    comments: Mapped[list["PostComment"]] = relationship(back_populates="post", cascade="all, delete-orphan", order_by="PostComment.created_at.asc()")


class PostReaction(Base):
    __tablename__ = "post_reactions"
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_reaction_user"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reaction_type: Mapped[str] = mapped_column(String(16), default="upvote", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    post: Mapped["Post"] = relationship(back_populates="reactions")
    user: Mapped["User"] = relationship()


class PostComment(Base):
    __tablename__ = "post_comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    post: Mapped["Post"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship()

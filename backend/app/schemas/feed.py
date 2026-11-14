from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator


class AuthorSummary(BaseModel):
    user_id: int
    name: str
    username: str
    avatar_url: str | None = None
    role: str = "member"

    model_config = {"from_attributes": True}


class GroupSummary(BaseModel):
    id: int
    name: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Comment cannot be empty")
        return value


class CommentResponse(BaseModel):
    id: int
    post_id: int
    author: AuthorSummary
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PostCreate(BaseModel):
    content: str | None = Field(default=None, max_length=10000)
    image_url: str | None = Field(default=None, max_length=512)

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None

    @field_validator("image_url")
    @classmethod
    def trim_image_url(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None

    @model_validator(mode="after")
    def validate_content_or_image(self) -> "PostCreate":
        if not self.content and not self.image_url:
            raise ValueError("Post must have text content or an image attachment")
        return self


class PostUpdate(BaseModel):
    content: str | None = Field(default=None, max_length=10000)

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None


class PostResponse(BaseModel):
    id: int
    group: GroupSummary
    author: AuthorSummary
    content: str | None = None
    image_url: str | None = None
    upvote_count: int = 0
    has_upvoted: bool = False
    comment_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None
    comments: list[CommentResponse] = []

    model_config = {"from_attributes": True}


class RoleUpdatePayload(BaseModel):
    role: Literal["admin", "moderator", "contributor", "member"]

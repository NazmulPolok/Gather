from datetime import datetime
import re
from pydantic import BaseModel, Field, field_validator, model_validator


class AuthorSummary(BaseModel):
    user_id: int
    name: str
    username: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class CommunitySummary(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
    privacy_type: str = "public"
    category: str | None = "General"
    member_count: int = 0
    is_member: bool = False
    is_admin: bool = False
    can_upload_video: bool = True

    model_config = {"from_attributes": True}


class CommunityCreate(BaseModel):
    name: str = Field(min_length=2, max_length=64)
    slug: str = Field(min_length=2, max_length=32)
    description: str | None = Field(default=None, max_length=1000)
    privacy_type: str = Field(default="public", pattern="^(public|private)$")
    category: str | None = Field(default="General", max_length=64)
    avatar_url: str | None = Field(default=None, max_length=512)
    banner_url: str | None = Field(default=None, max_length=512)

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-z0-9_]+$", v):
            raise ValueError("Community slug can only contain lowercase letters, numbers, and underscores")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Community name must be at least 2 characters")
        return v


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
    community_id: int | None = None
    community_slug: str | None = None
    title: str = Field(min_length=1, max_length=300)
    content: str | None = Field(default=None, max_length=10000)
    image_url: str | None = Field(default=None, max_length=512)
    video_url: str | None = Field(default=None, max_length=512)

    @field_validator("title")
    @classmethod
    def trim_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Post title cannot be empty")
        return value

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None

    @field_validator("image_url", "video_url")
    @classmethod
    def trim_media_url(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None

    @model_validator(mode="after")
    def validate_community_target(self) -> "PostCreate":
        if not self.community_id and not self.community_slug:
            raise ValueError("Community must be specified (community_id or community_slug)")
        return self


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    content: str | None = Field(default=None, max_length=10000)

    @field_validator("title")
    @classmethod
    def trim_title(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            return value if value else None
        return None


class PostResponse(BaseModel):
    id: int
    community: CommunitySummary
    author: AuthorSummary
    title: str
    content: str | None = None
    image_url: str | None = None
    video_url: str | None = None
    views_count: int = 0
    upvote_count: int = 0
    has_upvoted: bool = False
    comment_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None
    comments: list[CommentResponse] = []

    model_config = {"from_attributes": True}

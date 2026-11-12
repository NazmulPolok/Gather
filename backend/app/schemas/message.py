from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class MessageCreate(BaseModel):
    message_type: Literal["text", "image"] = "text"
    body: str | None = Field(default=None, max_length=10000)
    image_url: str | None = Field(default=None, max_length=512)
    is_anonymous: bool = False

    @field_validator("body")
    @classmethod
    def trim_body(cls, value: str | None) -> str | None:
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
    def validate_content_matches_type(self) -> "MessageCreate":
        if self.message_type == "text" and not self.body:
            raise ValueError("Text messages cannot be empty")
        if self.message_type == "image" and not self.image_url:
            raise ValueError("Image messages must include an image")
        return self


class MessageUpdate(BaseModel):
    body: str = Field(min_length=1, max_length=10000)

    @field_validator("body")
    @classmethod
    def trim_body(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message body cannot be empty")
        return value


class SeenUser(BaseModel):
    user_id: int
    name: str
    username: str
    avatar_url: str | None = None
    read_at: datetime | None = None


class MessageResponse(BaseModel):
    id: int
    group_id: int
    sender_id: int
    sender_name: str
    sender_username: str
    sender_avatar_url: str | None = None
    message_type: Literal["text", "image"]
    body: str | None = None
    image_url: str | None = None
    is_anonymous: bool = False
    is_edited: bool = False
    edited_at: datetime | None = None
    created_at: datetime
    status: Literal["sending", "sent", "delivered", "seen"] = "sent"
    seen_by: list[SeenUser] = []

    model_config = {"from_attributes": True}

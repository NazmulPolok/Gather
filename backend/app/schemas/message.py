from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class MessageCreate(BaseModel):
    message_type: Literal["text"] = "text"
    body: str = Field(min_length=1, max_length=10000)

    @field_validator("body")
    @classmethod
    def trim_body(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Text messages cannot be empty")
        return value


class MessageResponse(BaseModel):
    id: int
    group_id: int
    sender_id: int
    sender_name: str
    sender_username: str
    message_type: Literal["text"]
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}

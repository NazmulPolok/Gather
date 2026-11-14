from datetime import datetime
from typing import Literal

from pydantic import BaseModel
from typing import Literal


class NotificationItem(BaseModel):
    id: int
    group_id: int
    group_name: str
    actor_id: int
    actor_name: str
    actor_username: str
    notification_type: Literal["join_request", "message", "mention"]
    resolution: Literal["accepted", "declined"] | None
    message_id: int | None
    read_at: datetime | None
    created_at: datetime


class NotificationFeed(BaseModel):
    items: list[NotificationItem]
    unread_count: int


class JoinRequestResponse(BaseModel):
    action: Literal["accept", "decline"]

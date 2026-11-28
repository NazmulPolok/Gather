from datetime import datetime
from pydantic import BaseModel, Field


class UserSettingsUpdate(BaseModel):
    who_can_see_posts: str | None = Field(default=None, pattern="^(public|friends|only_me)$")
    who_can_comment: str | None = Field(default=None, pattern="^(public|friends|mentioned)$")
    who_can_tag: str | None = Field(default=None, pattern="^(everyone|friends|review)$")
    who_can_send_friend_requests: str | None = Field(default=None, pattern="^(everyone|friends_of_friends)$")
    who_can_see_friends_list: str | None = Field(default=None, pattern="^(public|friends|only_me)$")
    post_notifications_enabled: bool | None = None
    sound_enabled: bool | None = None
    language: str | None = Field(default=None, max_length=16)
    font_size: str | None = Field(default=None, pattern="^(standard|compact|comfortable)$")


class UserSettingsResponse(BaseModel):
    who_can_see_posts: str = "public"
    who_can_comment: str = "public"
    who_can_tag: str = "everyone"
    who_can_send_friend_requests: str = "everyone"
    who_can_see_friends_list: str = "public"
    post_notifications_enabled: bool = True
    sound_enabled: bool = True
    language: str = "en"
    font_size: str = "standard"
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserSessionResponse(BaseModel):
    id: str
    device: str
    browser: str
    ip_address: str | None = None
    location: str | None = None
    is_current: bool = False
    last_active_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class SavedPostCreate(BaseModel):
    collection_name: str = Field(default="Favorites", max_length=64)


class PostInteractionCreate(BaseModel):
    action_type: str = Field(pattern="^(hide|snooze|report|notify)$")
    reason: str | None = Field(default=None, max_length=255)
    days: int | None = 30

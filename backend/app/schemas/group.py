from typing import Literal

from pydantic import BaseModel, Field, field_validator


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    join_policy: Literal["open", "approval"] = "open"

    @field_validator("name")
    @classmethod
    def trim_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Group name cannot be empty")
        return value


class GroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    join_policy: Literal["open", "approval"] | None = None
    avatar_url: str | None = None

    @field_validator("name")
    @classmethod
    def trim_optional_name(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("Group name cannot be null")
        value = value.strip()
        if not value:
            raise ValueError("Group name cannot be empty")
        return value

    @field_validator("join_policy")
    @classmethod
    def reject_null_policy(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("Join policy cannot be null")
        return value



class GroupResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    owner_id: int
    join_policy: Literal["open", "approval"]
    avatar_url: str | None = None
    model_config = {"from_attributes": True}

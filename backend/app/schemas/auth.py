from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    username: str = Field(min_length=3, max_length=24, pattern=r"^[A-Za-z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("first_name", "last_name")
    @classmethod
    def trim_names(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be empty")
        return value

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def reject_whitespace_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Password cannot contain only spaces")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordRequestOTP(BaseModel):
    email: str = Field(min_length=3, max_length=320)

    @field_validator("email")
    @classmethod
    def normalize_identifier(cls, value: str) -> str:
        value = value.strip().lower()
        if not value:
            raise ValueError("Email or username cannot be empty")
        return value


class ForgotPasswordVerifyOTP(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_identifier(cls, value: str) -> str:
        value = value.strip().lower()
        if not value:
            raise ValueError("Email or username cannot be empty")
        return value

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        value = value.strip()
        if not value.isdigit() or len(value) != 6:
            raise ValueError("OTP must be 6 digits")
        return value

    @field_validator("new_password")
    @classmethod
    def reject_whitespace_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Password cannot contain only spaces")
        return value


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    username: str
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

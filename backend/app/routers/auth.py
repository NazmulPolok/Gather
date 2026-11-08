from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr
import hashlib
import hmac
import secrets
import smtplib
import ssl
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.password_reset_otp import PasswordResetOTP
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequestOTP,
    ForgotPasswordVerifyOTP,
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()


def _find_user_by_identifier(db: Session, identifier: str) -> User | None:
    return db.scalar(
        select(User).where(
            or_(
                func.lower(User.email) == identifier,
                func.lower(User.username) == identifier,
            )
        )
    )


def _otp_digest(email: str, otp: str) -> str:
    message = f"{email}:{otp}".encode()
    return hmac.new(settings.jwt_secret_key.encode(), message, hashlib.sha256).hexdigest()


def _send_password_reset_email(email: str, otp: str) -> None:
    if not settings.smtp_host or not settings.smtp_from:
        raise HTTPException(status_code=503, detail="Password reset email is not configured.")
    if bool(settings.smtp_user) != bool(settings.smtp_password):
        raise HTTPException(status_code=503, detail="Password reset email is not configured.")

    message = EmailMessage()
    message["Subject"] = "Your Gather password reset code"
    message["From"] = formataddr((settings.smtp_from_name, settings.smtp_from))
    message["To"] = email
    message.set_content(
        f"Hi,\n\n"
        f"Your Gather password reset code is:\n\n"
        f"  {otp}\n\n"
        "This code expires in 10 minutes.\n"
        "If you did not request this, you can safely ignore this email.\n\n"
        "— The Gather team"
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            smtp.starttls(context=ssl.create_default_context())
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to send the verification email. Please try again later.",
        ) from exc


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = str(payload.email).strip().lower()
    user = User(
        email=email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="That email address or username is already in use") from exc
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id), user=user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = str(payload.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return TokenResponse(access_token=create_access_token(user.id), user=user)


@router.post("/forgot-password/request-otp")
def request_password_reset_otp(payload: ForgotPasswordRequestOTP, db: Session = Depends(get_db)) -> dict[str, str]:
    if not settings.smtp_host or not settings.smtp_from:
        raise HTTPException(status_code=503, detail="Password reset email is not configured.")
    if bool(settings.smtp_user) != bool(settings.smtp_password):
        raise HTTPException(status_code=503, detail="Password reset email is not configured.")

    identifier = payload.email
    user = _find_user_by_identifier(db, identifier)
    response = {
        "status": "ok",
        "message": "If an account matches, a verification code will be emailed shortly.",
    }
    if user is None:
        return response

    now = datetime.now(timezone.utc)
    latest_otp = db.scalar(
        select(PasswordResetOTP)
        .where(PasswordResetOTP.email == user.email)
        .order_by(PasswordResetOTP.created_at.desc())
        .limit(1)
    )
    if latest_otp is not None and latest_otp.created_at is not None:
        created_at = latest_otp.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if now - created_at < timedelta(seconds=60):
            return response

    existing = db.scalars(
        select(PasswordResetOTP).where(
            PasswordResetOTP.email == user.email,
            PasswordResetOTP.is_used.is_(False),
        )
    ).all()
    for item in existing:
        item.is_used = True

    otp_code = f"{secrets.randbelow(1_000_000):06d}"

    otp_record = PasswordResetOTP(
        email=user.email,
        otp_hash=_otp_digest(user.email, otp_code),
        expires_at=now + timedelta(minutes=10),
        is_used=False,
    )
    db.add(otp_record)
    try:
        db.flush()
        _send_password_reset_email(user.email, otp_code)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return response


@router.post("/forgot-password/verify-otp", response_model=TokenResponse)
def verify_password_reset_otp(payload: ForgotPasswordVerifyOTP, db: Session = Depends(get_db)) -> TokenResponse:
    identifier = payload.email
    user = _find_user_by_identifier(db, identifier)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    now = datetime.now(timezone.utc)
    otp_record = db.scalar(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.email == user.email,
            PasswordResetOTP.is_used.is_(False),
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .with_for_update()
    )

    expires_at = otp_record.expires_at if otp_record is not None else None
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if otp_record is None or expires_at is None or expires_at < now or otp_record.attempts >= 5:
        if otp_record is not None and not otp_record.is_used:
            otp_record.is_used = True
            db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    if not hmac.compare_digest(otp_record.otp_hash, _otp_digest(user.email, payload.otp)):
        otp_record.attempts += 1
        if otp_record.attempts >= 5:
            otp_record.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")

    otp_record.is_used = True
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id), user=user)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user

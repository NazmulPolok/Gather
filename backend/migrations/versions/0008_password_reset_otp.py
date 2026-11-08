"""Add password reset OTP table."""
from alembic import op
import sqlalchemy as sa


revision = "0008_password_reset_otp"
down_revision = "0007_join_request_resolution"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "password_reset_otps",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("otp_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_used", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_password_reset_otps_email", "password_reset_otps", ["email"])


def downgrade() -> None:
    op.drop_index("ix_password_reset_otps_email", table_name="password_reset_otps")
    op.drop_table("password_reset_otps")

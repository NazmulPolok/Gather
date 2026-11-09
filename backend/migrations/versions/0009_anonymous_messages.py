"""Add is_anonymous column to messages."""
from alembic import op
import sqlalchemy as sa


revision = "0009_anonymous_messages"
down_revision = "0008_password_reset_otp"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "messages",
        sa.Column("is_anonymous", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("messages", "is_anonymous")

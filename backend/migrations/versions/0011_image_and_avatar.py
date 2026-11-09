"""Add avatar_url to users and image support to messages."""
from alembic import op
import sqlalchemy as sa


revision = "0011_image_and_avatar"
down_revision = "0010_membership_nickname"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add avatar_url to users table
    op.add_column("users", sa.Column("avatar_url", sa.String(length=512), nullable=True))

    # 2. Update messages table to support both text and image messages
    op.drop_constraint("ck_messages_text_only", "messages", type_="check")
    op.alter_column("messages", "body", existing_type=sa.Text(), nullable=True)
    op.add_column("messages", sa.Column("image_url", sa.String(length=512), nullable=True))
    op.create_check_constraint(
        "ck_messages_type_and_content",
        "messages",
        "(message_type = 'text' AND body IS NOT NULL) OR (message_type = 'image' AND image_url IS NOT NULL)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_messages_type_and_content", "messages", type_="check")
    op.drop_column("messages", "image_url")
    op.alter_column("messages", "body", existing_type=sa.Text(), nullable=False)
    op.create_check_constraint(
        "ck_messages_text_only", "messages", "message_type = 'text' AND body IS NOT NULL"
    )
    op.drop_column("users", "avatar_url")

"""Limit Version 1 messages to text content."""
from alembic import op
import sqlalchemy as sa

revision = "0003_text_only"
down_revision = "0002_integrity"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_messages_content_matches_type", "messages", type_="check")
    op.drop_column("messages", "image_key")
    op.alter_column("messages", "body", existing_type=sa.Text(), nullable=False)
    op.create_check_constraint(
        "ck_messages_text_only", "messages", "message_type = 'text' AND body IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_constraint("ck_messages_text_only", "messages", type_="check")
    op.alter_column("messages", "body", existing_type=sa.Text(), nullable=True)
    op.add_column("messages", sa.Column("image_key", sa.String(length=512), nullable=True))
    op.create_check_constraint(
        "ck_messages_content_matches_type",
        "messages",
        "(message_type = 'text' AND body IS NOT NULL AND image_key IS NULL) OR "
        "(message_type = 'image' AND body IS NULL AND image_key IS NOT NULL)",
    )

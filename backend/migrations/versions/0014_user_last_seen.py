"""Add last_seen_at column to users table."""
from alembic import op
import sqlalchemy as sa


revision = "0014_user_last_seen"
down_revision = "0013_group_avatar"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "last_seen_at")

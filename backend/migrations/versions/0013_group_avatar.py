"""Add avatar_url column to groups table."""
from alembic import op
import sqlalchemy as sa


revision = "0013_group_avatar"
down_revision = "0012_user_nickname"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("groups", sa.Column("avatar_url", sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column("groups", "avatar_url")

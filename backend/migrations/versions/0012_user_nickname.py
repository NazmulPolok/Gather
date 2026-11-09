"""Add nickname column to users table."""
from alembic import op
import sqlalchemy as sa


revision = "0012_user_nickname"
down_revision = "0011_image_and_avatar"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("nickname", sa.String(length=64), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "nickname")

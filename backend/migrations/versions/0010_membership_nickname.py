"""Add nickname column to memberships."""
from alembic import op
import sqlalchemy as sa


revision = "0010_membership_nickname"
down_revision = "0009_anonymous_messages"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "memberships",
        sa.Column("nickname", sa.String(length=64), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("memberships", "nickname")

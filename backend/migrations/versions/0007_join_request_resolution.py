"""Store decisions made from group join request notifications."""
from alembic import op
import sqlalchemy as sa


revision = "0007_join_request_resolution"
down_revision = "0006_group_invite_code"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("notifications", sa.Column("resolution", sa.String(length=16), nullable=True))


def downgrade() -> None:
    op.drop_column("notifications", "resolution")

"""Use case-insensitive account email uniqueness and constrain stored values."""
from alembic import op
import sqlalchemy as sa

revision = "0002_integrity"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_users_email", table_name="users")
    op.create_index("uq_users_email_ci", "users", [sa.text("lower(email)")], unique=True)
    op.create_check_constraint("ck_groups_join_policy", "groups", "join_policy IN ('open', 'approval')")
    op.create_check_constraint("ck_memberships_role", "memberships", "role IN ('admin', 'member')")
    op.create_check_constraint(
        "ck_memberships_status", "memberships", "status IN ('active', 'pending', 'rejected')"
    )
    op.create_check_constraint(
        "ck_messages_content_matches_type",
        "messages",
        "(message_type = 'text' AND body IS NOT NULL AND image_key IS NULL) OR "
        "(message_type = 'image' AND body IS NULL AND image_key IS NOT NULL)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_messages_content_matches_type", "messages", type_="check")
    op.drop_constraint("ck_memberships_status", "memberships", type_="check")
    op.drop_constraint("ck_memberships_role", "memberships", type_="check")
    op.drop_constraint("ck_groups_join_policy", "groups", type_="check")
    op.drop_index("uq_users_email_ci", table_name="users")
    op.create_index("ix_users_email", "users", ["email"], unique=True)

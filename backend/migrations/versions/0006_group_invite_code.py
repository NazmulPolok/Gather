"""Give each group an eight character invite code."""
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


revision = "0006_group_invite_code"
down_revision = "0005_user_names"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("groups", sa.Column("invite_code", sa.String(length=8), nullable=True))
    connection = op.get_bind()
    group_ids = connection.execute(sa.text("SELECT id FROM groups ORDER BY id")).scalars().all()
    for group_id in group_ids:
        connection.execute(
            sa.text("UPDATE groups SET invite_code = :code WHERE id = :id"),
            {"code": uuid4().hex[:8].upper(), "id": group_id},
        )
    op.alter_column("groups", "invite_code", existing_type=sa.String(length=8), nullable=False)
    op.create_unique_constraint("uq_groups_invite_code", "groups", ["invite_code"])


def downgrade() -> None:
    op.drop_constraint("uq_groups_invite_code", "groups", type_="unique")
    op.drop_column("groups", "invite_code")

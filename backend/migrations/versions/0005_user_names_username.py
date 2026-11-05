"""Add display names and unique usernames to user accounts."""
from alembic import op
import sqlalchemy as sa

revision = "0005_user_names"
down_revision = "0004_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("first_name", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("last_name", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("username", sa.String(length=24), nullable=True))
    op.execute(
        "UPDATE users SET first_name = '', last_name = '', username = 'user_' || id::text "
        "WHERE first_name IS NULL OR last_name IS NULL OR username IS NULL"
    )
    op.alter_column("users", "first_name", existing_type=sa.String(length=50), nullable=False)
    op.alter_column("users", "last_name", existing_type=sa.String(length=50), nullable=False)
    op.alter_column("users", "username", existing_type=sa.String(length=24), nullable=False)
    op.create_index("uq_users_username_ci", "users", [sa.text("lower(username)")], unique=True)


def downgrade() -> None:
    op.drop_index("uq_users_username_ci", table_name="users")
    op.drop_column("users", "username")
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")

"""pages_and_video_privacy

Revision ID: 0016_pages_and_video_privacy
Revises: 0015_message_edits_and_newsfeed
Create Date: 2026-11-19 15:11:00
"""
from alembic import op
import sqlalchemy as sa

revision = '0016_pages_and_video_privacy'
down_revision = '0015_message_edits_and_newsfeed'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('communities', sa.Column('privacy_type', sa.String(length=16), server_default='public', nullable=False))
    op.add_column('communities', sa.Column('category', sa.String(length=64), server_default='General', nullable=True))
    op.add_column('posts', sa.Column('views_count', sa.Integer(), server_default='0', nullable=False))


def downgrade() -> None:
    op.drop_column('posts', 'views_count')
    op.drop_column('communities', 'category')
    op.drop_column('communities', 'privacy_type')

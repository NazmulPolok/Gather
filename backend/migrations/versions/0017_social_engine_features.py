"""social_engine_features

Revision ID: 0017_social_engine_features
Revises: 0016_pages_and_video_privacy
Create Date: 2026-11-28 15:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = '0017_social_engine_features'
down_revision = '0016_pages_and_video_privacy'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Update posts table
    op.add_column('posts', sa.Column('audience', sa.String(length=32), server_default='public', nullable=False))
    op.add_column('posts', sa.Column('allow_comments', sa.String(length=32), server_default='public', nullable=False))
    op.add_column('posts', sa.Column('is_archived', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('posts', sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('posts', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('posts', sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('posts', sa.Column('feeling', sa.String(length=100), nullable=True))
    op.add_column('posts', sa.Column('location', sa.String(length=100), nullable=True))

    # 2. Create user_settings table
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('who_can_see_posts', sa.String(length=32), server_default='public', nullable=False),
        sa.Column('who_can_comment', sa.String(length=32), server_default='public', nullable=False),
        sa.Column('who_can_tag', sa.String(length=32), server_default='everyone', nullable=False),
        sa.Column('who_can_send_friend_requests', sa.String(length=32), server_default='everyone', nullable=False),
        sa.Column('who_can_see_friends_list', sa.String(length=32), server_default='public', nullable=False),
        sa.Column('post_notifications_enabled', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('sound_enabled', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('language', sa.String(length=16), server_default='en', nullable=False),
        sa.Column('font_size', sa.String(length=16), server_default='standard', nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 3. Create user_sessions table
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('device', sa.String(length=128), nullable=False),
        sa.Column('browser', sa.String(length=128), nullable=False),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('location', sa.String(length=128), nullable=True),
        sa.Column('is_current', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('last_active_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_user_sessions_user_id', 'user_sessions', ['user_id'])

    # 4. Create saved_posts table
    op.create_table(
        'saved_posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('collection_name', sa.String(length=64), server_default='Favorites', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'post_id', name='uq_user_saved_post'),
    )
    op.create_index('ix_saved_posts_user_id', 'saved_posts', ['user_id'])

    # 5. Create post_interactions table (hide, snooze, report, notify)
    op.create_table(
        'post_interactions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('posts.id', ondelete='CASCADE'), nullable=True),
        sa.Column('target_user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('action_type', sa.String(length=32), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_post_interactions_user_action', 'post_interactions', ['user_id', 'action_type'])


def downgrade() -> None:
    op.drop_table('post_interactions')
    op.drop_table('saved_posts')
    op.drop_table('user_sessions')
    op.drop_table('user_settings')
    op.drop_column('posts', 'location')
    op.drop_column('posts', 'feeling')
    op.drop_column('posts', 'scheduled_at')
    op.drop_column('posts', 'deleted_at')
    op.drop_column('posts', 'is_deleted')
    op.drop_column('posts', 'is_archived')
    op.drop_column('posts', 'allow_comments')
    op.drop_column('posts', 'audience')

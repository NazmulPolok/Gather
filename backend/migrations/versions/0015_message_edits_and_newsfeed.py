"""message_edits_and_newsfeed

Revision ID: 0015_message_edits_and_newsfeed
Revises: 0014_user_last_seen
Create Date: 2026-11-19 03:37:12.626056
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0015_message_edits_and_newsfeed'
down_revision = '0014_user_last_seen'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('communities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('slug', sa.String(length=32), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('avatar_url', sa.String(length=512), nullable=True),
        sa.Column('banner_url', sa.String(length=512), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_communities_slug'), 'communities', ['slug'], unique=True)

    op.create_table('community_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('community_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=16), nullable=False, server_default='member'),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('community_id', 'user_id', name='uq_community_member')
    )
    op.create_index(op.f('ix_community_members_community_id'), 'community_members', ['community_id'], unique=False)
    op.create_index(op.f('ix_community_members_user_id'), 'community_members', ['user_id'], unique=False)

    op.create_table('posts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('community_id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=512), nullable=True),
        sa.Column('video_url', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('title IS NOT NULL AND length(trim(title)) > 0', name='ck_posts_title_non_empty'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_posts_author_id'), 'posts', ['author_id'], unique=False)
    op.create_index(op.f('ix_posts_community_id'), 'posts', ['community_id'], unique=False)

    op.create_table('post_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_post_comments_post_id'), 'post_comments', ['post_id'], unique=False)

    op.create_table('post_reactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('reaction_type', sa.String(length=16), nullable=False, server_default='upvote'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('post_id', 'user_id', name='uq_post_reaction_user')
    )
    op.create_index(op.f('ix_post_reactions_post_id'), 'post_reactions', ['post_id'], unique=False)

    op.execute("UPDATE groups SET created_at = now() WHERE created_at IS NULL")
    op.alter_column('groups', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=False,
               existing_server_default=sa.text('now()'))

    op.add_column('messages', sa.Column('is_edited', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('messages', sa.Column('edited_at', sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE messages SET created_at = now() WHERE created_at IS NULL")
    op.alter_column('messages', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=False,
               existing_server_default=sa.text('now()'))

    op.execute("UPDATE users SET created_at = now() WHERE created_at IS NULL")
    op.alter_column('users', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=False,
               existing_server_default=sa.text('now()'))

def downgrade() -> None:
    op.alter_column('users', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=True,
               existing_server_default=sa.text('now()'))
    op.alter_column('messages', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=True,
               existing_server_default=sa.text('now()'))
    op.drop_column('messages', 'edited_at')
    op.drop_column('messages', 'is_edited')
    op.alter_column('groups', 'created_at',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=True,
               existing_server_default=sa.text('now()'))
    op.drop_index(op.f('ix_post_reactions_post_id'), table_name='post_reactions')
    op.drop_table('post_reactions')
    op.drop_index(op.f('ix_post_comments_post_id'), table_name='post_comments')
    op.drop_table('post_comments')
    op.drop_index(op.f('ix_posts_community_id'), table_name='posts')
    op.drop_index(op.f('ix_posts_author_id'), table_name='posts')
    op.drop_table('posts')
    op.drop_index(op.f('ix_community_members_user_id'), table_name='community_members')
    op.drop_index(op.f('ix_community_members_community_id'), table_name='community_members')
    op.drop_table('community_members')
    op.drop_index(op.f('ix_communities_slug'), table_name='communities')
    op.drop_table('communities')

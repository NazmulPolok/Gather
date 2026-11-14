from datetime import datetime, timezone
from pathlib import Path
import secrets
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.group import Group
from app.models.membership import Membership
from app.models.post import Post, PostComment, PostReaction
from app.models.user import User
from app.schemas.feed import (
    AuthorSummary,
    CommentCreate,
    CommentResponse,
    GroupSummary,
    PostCreate,
    PostResponse,
    PostUpdate,
)
from app.services.permissions import active_membership

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
POSTS_DIR = UPLOAD_DIR / "posts"
POSTS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _get_author_summary(user: User, membership: Membership | None) -> AuthorSummary:
    role = membership.role if membership else "member"
    name = (
        (membership.nickname if membership and membership.nickname else None)
        or user.nickname
        or " ".join(filter(None, [user.first_name, user.last_name]))
        or user.username
    )
    return AuthorSummary(
        user_id=user.id,
        name=name,
        username=user.username,
        avatar_url=user.avatar_url,
        role=role,
    )


def _build_post_response(post: Post, current_user_id: int, db: Session) -> PostResponse:
    # Author membership in post's group
    author_membership = db.scalar(
        select(Membership).where(
            Membership.group_id == post.group_id,
            Membership.user_id == post.author_id,
        )
    )
    author_summary = _get_author_summary(post.author, author_membership)
    group_summary = GroupSummary(
        id=post.group.id,
        name=post.group.name,
        avatar_url=post.group.avatar_url,
    )

    # Upvotes
    upvote_count = db.scalar(
        select(func.count(PostReaction.id)).where(PostReaction.post_id == post.id)
    ) or 0
    has_upvoted = db.scalar(
        select(PostReaction.id).where(
            PostReaction.post_id == post.id,
            PostReaction.user_id == current_user_id,
        )
    ) is not None

    # Comments
    comments_query = (
        select(PostComment, User, Membership)
        .join(User, PostComment.author_id == User.id)
        .outerjoin(
            Membership,
            (Membership.user_id == User.id) & (Membership.group_id == post.group_id),
        )
        .where(PostComment.post_id == post.id)
        .order_by(PostComment.created_at.asc())
    )
    comment_rows = db.execute(comments_query).all()
    comment_responses = [
        CommentResponse(
            id=c.id,
            post_id=c.post_id,
            author=_get_author_summary(u, m),
            content=c.content,
            created_at=c.created_at,
        )
        for c, u, m in comment_rows
    ]

    return PostResponse(
        id=post.id,
        group=group_summary,
        author=author_summary,
        content=post.content,
        image_url=post.image_url,
        upvote_count=upvote_count,
        has_upvoted=has_upvoted,
        comment_count=len(comment_responses),
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=comment_responses,
    )


@router.post("/feed/upload-image")
async def upload_post_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.",
        )
    ext = ALLOWED_IMAGE_TYPES[content_type]
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size too large. Maximum size is 10MB.",
        )
    filename = f"{secrets.token_hex(16)}{ext}"
    dest = POSTS_DIR / filename
    dest.write_bytes(contents)

    return {"image_url": f"/uploads/posts/{filename}"}


@router.get("/feed", response_model=list[PostResponse])
def get_news_feed(
    group_id: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PostResponse]:
    # Active group IDs the user belongs to
    user_group_ids = db.scalars(
        select(Membership.group_id).where(
            Membership.user_id == user.id,
            Membership.status == "active",
        )
    ).all()

    if not user_group_ids:
        return []

    query = select(Post).join(Group).where(Post.group_id.in_(user_group_ids))
    if group_id is not None:
        if group_id not in user_group_ids:
            raise HTTPException(status_code=403, detail="You are not an active member of this group")
        query = query.where(Post.group_id == group_id)

    query = query.order_by(Post.created_at.desc()).limit(limit)
    posts = db.scalars(query).all()

    return [_build_post_response(post, user.id, db) for post in posts]


@router.get("/groups/{group_id}/posts", response_model=list[PostResponse])
def get_group_posts(
    group_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PostResponse]:
    active_membership(db, group_id, user.id)
    query = (
        select(Post)
        .where(Post.group_id == group_id)
        .order_by(Post.created_at.desc())
        .limit(limit)
    )
    posts = db.scalars(query).all()
    return [_build_post_response(post, user.id, db) for post in posts]


@router.post("/groups/{group_id}/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_group_post(
    group_id: int,
    payload: PostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PostResponse:
    active_membership(db, group_id, user.id)
    post = Post(
        group_id=group_id,
        author_id=user.id,
        content=payload.content,
        image_url=payload.image_url,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return _build_post_response(post, user.id, db)


@router.patch("/posts/{post_id}", response_model=PostResponse)
def edit_post(
    post_id: int,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PostResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own posts")

    clean_content = payload.content.strip() if payload.content else None
    if not clean_content and not post.image_url:
        raise HTTPException(status_code=400, detail="Post content cannot be empty")

    post.content = clean_content
    post.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    return _build_post_response(post, user.id, db)


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    membership = active_membership(db, post.group_id, user.id)
    is_author = (post.author_id == user.id)
    is_admin = (membership.role == "admin" or post.group.owner_id == user.id)
    is_moderator = (membership.role == "moderator")

    if not is_author and not is_admin and not is_moderator:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this post",
        )

    # Clean up uploaded image if present
    if post.image_url and post.image_url.startswith("/uploads/posts/"):
        try:
            rel = post.image_url.removeprefix("/uploads/posts/")
            img_path = POSTS_DIR / rel
            if img_path.is_file():
                img_path.unlink(missing_ok=True)
        except Exception:
            pass

    db.delete(post)
    db.commit()
    return {"status": "deleted", "post_id": post_id}


@router.post("/posts/{post_id}/react")
def toggle_post_reaction(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    active_membership(db, post.group_id, user.id)

    existing_reaction = db.scalar(
        select(PostReaction).where(
            PostReaction.post_id == post_id,
            PostReaction.user_id == user.id,
        )
    )

    if existing_reaction is not None:
        db.delete(existing_reaction)
        db.commit()
        has_upvoted = False
    else:
        new_reaction = PostReaction(
            post_id=post_id,
            user_id=user.id,
            reaction_type="upvote",
        )
        db.add(new_reaction)
        db.commit()
        has_upvoted = True

    upvote_count = db.scalar(
        select(func.count(PostReaction.id)).where(PostReaction.post_id == post_id)
    ) or 0

    return {
        "status": "ok",
        "post_id": post_id,
        "has_upvoted": has_upvoted,
        "upvote_count": upvote_count,
    }


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def list_post_comments(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[CommentResponse]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    active_membership(db, post.group_id, user.id)

    comments_query = (
        select(PostComment, User, Membership)
        .join(User, PostComment.author_id == User.id)
        .outerjoin(
            Membership,
            (Membership.user_id == User.id) & (Membership.group_id == post.group_id),
        )
        .where(PostComment.post_id == post.id)
        .order_by(PostComment.created_at.asc())
    )
    rows = db.execute(comments_query).all()
    return [
        CommentResponse(
            id=c.id,
            post_id=c.post_id,
            author=_get_author_summary(u, m),
            content=c.content,
            created_at=c.created_at,
        )
        for c, u, m in rows
    ]


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_post_comment(
    post_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommentResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    membership = active_membership(db, post.group_id, user.id)

    comment = PostComment(
        post_id=post_id,
        author_id=user.id,
        content=payload.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        author=_get_author_summary(user, membership),
        content=comment.content,
        created_at=comment.created_at,
    )


@router.delete("/posts/comments/{comment_id}")
def delete_post_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    comment = db.scalar(select(PostComment).where(PostComment.id == comment_id))
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    post = db.scalar(select(Post).where(Post.id == comment.post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    membership = active_membership(db, post.group_id, user.id)
    is_author = (comment.author_id == user.id)
    is_admin = (membership.role == "admin" or post.group.owner_id == user.id)
    is_moderator = (membership.role == "moderator")

    if not is_author and not is_admin and not is_moderator:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this comment",
        )

    db.delete(comment)
    db.commit()
    return {"status": "deleted", "comment_id": comment_id}

from datetime import datetime, timezone
from pathlib import Path
import secrets
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.media import (
    optimize_video_to_1080p,
    safe_delete_upload_file,
    validate_image_file,
    validate_video_file,
)
from app.db.session import get_db
from app.models.community import Community, CommunityMember
from app.models.post import Post, PostComment, PostReaction
from app.models.user import User
from app.schemas.feed import (
    AuthorSummary,
    CommentCreate,
    CommentResponse,
    CommunityCreate,
    CommunitySummary,
    PostCreate,
    PostResponse,
    PostUpdate,
)

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
POSTS_DIR = UPLOAD_DIR / "posts"
POSTS_DIR.mkdir(parents=True, exist_ok=True)


def _get_author_summary(user: User) -> AuthorSummary:
    name = (
        user.nickname
        or " ".join(filter(None, [user.first_name, user.last_name]))
        or user.username
    )
    return AuthorSummary(
        user_id=user.id,
        name=name,
        username=user.username,
        avatar_url=user.avatar_url,
    )


def _build_community_summary(community: Community, current_user_id: int, db: Session) -> CommunitySummary:
    member_count = db.scalar(
        select(func.count(CommunityMember.id)).where(CommunityMember.community_id == community.id)
    ) or 0

    is_member = db.scalar(
        select(CommunityMember.id).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == current_user_id,
        )
    ) is not None

    return CommunitySummary(
        id=community.id,
        name=community.name,
        slug=community.slug,
        description=community.description,
        avatar_url=community.avatar_url,
        banner_url=community.banner_url,
        member_count=member_count,
        is_member=is_member,
    )


def _build_post_response(post: Post, current_user_id: int, db: Session) -> PostResponse:
    community_summary = _build_community_summary(post.community, current_user_id, db)
    author_summary = _get_author_summary(post.author)

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
        select(PostComment, User)
        .join(User, PostComment.author_id == User.id)
        .where(PostComment.post_id == post.id)
        .order_by(PostComment.created_at.asc())
    )
    comment_rows = db.execute(comments_query).all()
    comment_responses = [
        CommentResponse(
            id=c.id,
            post_id=c.post_id,
            author=_get_author_summary(u),
            content=c.content,
            created_at=c.created_at,
        )
        for c, u in comment_rows
    ]

    return PostResponse(
        id=post.id,
        community=community_summary,
        author=author_summary,
        title=post.title,
        content=post.content,
        image_url=post.image_url,
        video_url=post.video_url,
        upvote_count=upvote_count,
        has_upvoted=has_upvoted,
        comment_count=len(comment_responses),
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=comment_responses,
    )


# ==========================================
# Community Endpoints
# ==========================================

@router.get("/communities", response_model=list[CommunitySummary])
@router.get("/feed/communities", response_model=list[CommunitySummary])
def list_communities(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[CommunitySummary]:
    communities = db.scalars(select(Community).order_by(Community.name.asc())).all()
    return [_build_community_summary(c, user.id, db) for c in communities]


@router.post("/communities", response_model=CommunitySummary, status_code=status.HTTP_201_CREATED)
@router.post("/feed/communities", response_model=CommunitySummary, status_code=status.HTTP_201_CREATED)
def create_community(
    payload: CommunityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommunitySummary:
    existing = db.scalar(select(Community).where(Community.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=400, detail=f"Community r/{payload.slug} already exists")

    community = Community(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        created_by_id=user.id,
    )
    db.add(community)
    db.flush()

    # Creator automatically joins as admin
    membership = CommunityMember(
        community_id=community.id,
        user_id=user.id,
        role="admin",
    )
    db.add(membership)
    db.commit()
    db.refresh(community)

    return _build_community_summary(community, user.id, db)


@router.get("/communities/{slug}", response_model=CommunitySummary)
@router.get("/feed/communities/{slug}", response_model=CommunitySummary)
def get_community(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommunitySummary:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return _build_community_summary(community, user.id, db)


@router.post("/communities/{slug}/join")
@router.post("/feed/communities/{slug}/join")
def join_community(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    existing = db.scalar(
        select(CommunityMember).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == user.id,
        )
    )
    if not existing:
        member = CommunityMember(
            community_id=community.id,
            user_id=user.id,
            role="member",
        )
        db.add(member)
        db.commit()

    return {"status": "joined", "slug": slug}


@router.post("/communities/{slug}/leave")
@router.post("/feed/communities/{slug}/leave")
def leave_community(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    existing = db.scalar(
        select(CommunityMember).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == user.id,
        )
    )
    if existing:
        db.delete(existing)
        db.commit()

    return {"status": "left", "slug": slug}


# ==========================================
# Feed & Post Endpoints
# ==========================================

@router.post("/feed/upload-media")
@router.post("/feed/upload-image")
async def upload_post_media(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    contents = await file.read()
    ct = (file.content_type or "").lower().split(";")[0].strip()
    
    # Check if video
    if ct.startswith("video/") or ct in ("video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/avi"):
        ext = validate_video_file(contents, ct)
        base_name = secrets.token_hex(16)
        raw_temp = POSTS_DIR / f"raw_{base_name}{ext}"
        out_file = POSTS_DIR / f"{base_name}.mp4"
        raw_temp.write_bytes(contents)
        try:
            optimize_video_to_1080p(raw_temp, out_file)
        finally:
            raw_temp.unlink(missing_ok=True)
            
        video_url = f"/uploads/posts/{out_file.name}"
        return {
            "media_type": "video",
            "video_url": video_url,
            "image_url": "",
        }
    
    # Otherwise process as image
    ext = validate_image_file(contents, file.content_type or "")
    filename = f"{secrets.token_hex(16)}{ext}"
    dest = POSTS_DIR / filename
    dest.write_bytes(contents)

    return {
        "media_type": "image",
        "image_url": f"/uploads/posts/{filename}",
        "video_url": "",
    }


@router.get("/feed", response_model=list[PostResponse])
def get_news_feed(
    feed_type: str = Query(default="all"),  # 'all' (Popular), 'home' (Joined)
    community_slug: str | None = Query(default=None),
    author_username: str | None = Query(default=None),
    sort: str = Query(default="new"),  # 'new', 'top'
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PostResponse]:
    query = select(Post).join(Community)

    if author_username:
        target_author = db.scalar(select(User).where(func.lower(User.username) == author_username.lower()))
        if not target_author:
            raise HTTPException(status_code=404, detail="User not found")
        query = query.where(Post.author_id == target_author.id)
    elif community_slug:
        community = db.scalar(select(Community).where(Community.slug == community_slug.lower()))
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")
        query = query.where(Post.community_id == community.id)
    elif feed_type == "home":
        # Only posts from communities the user joined
        joined_community_ids = db.scalars(
            select(CommunityMember.community_id).where(CommunityMember.user_id == user.id)
        ).all()
        if not joined_community_ids:
            return []
        query = query.where(Post.community_id.in_(joined_community_ids))

    if sort == "top":
        upvote_subq = (
            select(PostReaction.post_id, func.count(PostReaction.id).label("score"))
            .group_by(PostReaction.post_id)
            .subquery()
        )
        query = query.outerjoin(upvote_subq, Post.id == upvote_subq.c.post_id).order_by(
            func.coalesce(upvote_subq.c.score, 0).desc(),
            Post.created_at.desc(),
        )
    else:
        query = query.order_by(Post.created_at.desc())

    posts = db.scalars(query.limit(limit)).all()
    return [_build_post_response(post, user.id, db) for post in posts]


@router.get("/feed/users/{username}/posts", response_model=list[PostResponse])
def get_user_posts(
    username: str,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PostResponse]:
    target_author = db.scalar(select(User).where(func.lower(User.username) == username.lower()))
    if not target_author:
        raise HTTPException(status_code=404, detail="User not found")

    query = (
        select(Post)
        .join(Community)
        .where(Post.author_id == target_author.id)
        .order_by(Post.created_at.desc())
        .limit(limit)
    )
    posts = db.scalars(query).all()
    return [_build_post_response(post, user.id, db) for post in posts]


@router.post("/feed/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PostResponse:
    if payload.community_id:
        community = db.scalar(select(Community).where(Community.id == payload.community_id))
    elif payload.community_slug:
        community = db.scalar(select(Community).where(Community.slug == payload.community_slug.lower()))
    else:
        raise HTTPException(status_code=400, detail="Community is required")

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    post = Post(
        community_id=community.id,
        author_id=user.id,
        title=payload.title,
        content=payload.content,
        image_url=payload.image_url,
        video_url=payload.video_url,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return _build_post_response(post, user.id, db)


@router.get("/feed/posts/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PostResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _build_post_response(post, user.id, db)


@router.patch("/feed/posts/{post_id}", response_model=PostResponse)
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

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content

    post.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    return _build_post_response(post, user.id, db)


@router.delete("/feed/posts/{post_id}")
@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    is_author = (post.author_id == user.id)
    is_community_creator = (post.community.created_by_id == user.id)

    if not is_author and not is_community_creator:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this post",
        )

    # Clean up uploaded media safely
    safe_delete_upload_file(POSTS_DIR, post.image_url, "/uploads/posts/")
    safe_delete_upload_file(POSTS_DIR, post.video_url, "/uploads/posts/")

    db.delete(post)
    db.commit()
    return {"status": "deleted", "post_id": post_id}


@router.post("/feed/posts/{post_id}/react")
@router.post("/feed/posts/{post_id}/upvote")
@router.post("/posts/{post_id}/react")
def toggle_post_reaction(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

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


@router.get("/feed/posts/{post_id}/comments", response_model=list[CommentResponse])
@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def list_post_comments(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[CommentResponse]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    comments_query = (
        select(PostComment, User)
        .join(User, PostComment.author_id == User.id)
        .where(PostComment.post_id == post.id)
        .order_by(PostComment.created_at.asc())
    )
    rows = db.execute(comments_query).all()
    return [
        CommentResponse(
            id=c.id,
            post_id=c.post_id,
            author=_get_author_summary(u),
            content=c.content,
            created_at=c.created_at,
        )
        for c, u in rows
    ]


@router.post("/feed/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
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
        author=_get_author_summary(user),
        content=comment.content,
        created_at=comment.created_at,
    )


@router.delete("/feed/comments/{comment_id}")
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

    is_author = (comment.author_id == user.id)
    is_post_author = (post.author_id == user.id)
    is_community_creator = (post.community.created_by_id == user.id)

    if not is_author and not is_post_author and not is_community_creator:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this comment",
        )

    db.delete(comment)
    db.commit()
    return {"status": "deleted", "comment_id": comment_id}

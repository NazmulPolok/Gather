from datetime import datetime, timezone
from pathlib import Path
import secrets
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.cache import cache, make_key, invalidate_feed
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
    JoinRequestResponse,
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
    # Only active members (not pending)
    member_count = db.scalar(
        select(func.count(CommunityMember.id)).where(
            CommunityMember.community_id == community.id,
            CommunityMember.role.in_(["member", "admin"]),
        )
    ) or 0

    role = db.scalar(
        select(CommunityMember.role).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == current_user_id,
        )
    )
    is_admin = (community.created_by_id == current_user_id) or (role == "admin")
    is_pending = role == "pending"
    is_member = (role in ["member", "admin"]) or is_admin

    privacy_type = getattr(community, "privacy_type", "public") or "public"
    join_rule = getattr(community, "join_rule", "open") or "open"
    category = getattr(community, "category", "General") or "General"

    # In Private Community: only admin can post.
    # In Public Page: all members can post.
    if privacy_type == "private":
        can_post = is_admin
    else:
        can_post = True

    # In Watch: only channel owners/admins can upload videos
    can_upload_video = is_admin

    pending_requests_count = 0
    if is_admin:
        pending_requests_count = db.scalar(
            select(func.count(CommunityMember.id)).where(
                CommunityMember.community_id == community.id,
                CommunityMember.role == "pending",
            )
        ) or 0

    creator_username = None
    creator_name = None
    if community.created_by_id:
        creator_user = community.creator or db.get(User, community.created_by_id)
        if creator_user:
            creator_username = creator_user.username
            creator_name = f"{creator_user.first_name} {creator_user.last_name}".strip()

    return CommunitySummary(
        id=community.id,
        name=community.name,
        slug=community.slug,
        description=community.description,
        avatar_url=community.avatar_url,
        banner_url=community.banner_url,
        privacy_type=privacy_type,
        join_rule=join_rule,
        category=category,
        member_count=member_count,
        is_member=is_member,
        is_admin=is_admin,
        is_pending=is_pending,
        can_post=can_post,
        can_upload_video=can_upload_video,
        pending_requests_count=pending_requests_count,
        creator_username=creator_username,
        creator_name=creator_name,
    )


def _build_post_response(post: Post, current_user_id: int, db: Session) -> PostResponse:
    community_summary = _build_community_summary(post.community, current_user_id, db)
    author_summary = _get_author_summary(post.author)

    # Upvotes / Likes
    upvote_count = db.scalar(
        select(func.count(PostReaction.id)).where(PostReaction.post_id == post.id)
    ) or 0
    has_upvoted = db.scalar(
        select(PostReaction.id).where(
            PostReaction.post_id == post.id,
            PostReaction.user_id == current_user_id,
        )
    ) is not None

    # Views count
    views_count = getattr(post, "views_count", 0) or 0
    source = getattr(post, "source", "feed") or "feed"

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
        views_count=views_count,
        source=source,
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
    cache_key = make_key("communities", user.id)
    cached = cache.get_json(cache_key)
    if cached is not None:
        try:
            return [CommunitySummary.model_validate(c) for c in cached]
        except Exception:
            pass

    communities = db.scalars(select(Community).order_by(Community.name.asc())).all()
    summaries = [_build_community_summary(c, user.id, db) for c in communities]
    cache.set_json(cache_key, [s.model_dump(mode="json") for s in summaries], ex=60)
    return summaries


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
        privacy_type=payload.privacy_type or "public",
        join_rule=payload.join_rule or "open",
        category=payload.category or "General",
        avatar_url=payload.avatar_url,
        banner_url=payload.banner_url,
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

    cache.delete_pattern("gather:communities:*")
    invalidate_feed()
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

    is_private_approval = (
        getattr(community, "privacy_type", "public") == "private"
        and getattr(community, "join_rule", "open") == "approval"
    )

    if not existing:
        new_role = "pending" if is_private_approval else "member"
        member = CommunityMember(
            community_id=community.id,
            user_id=user.id,
            role=new_role,
        )
        db.add(member)
        db.commit()
        cache.delete_pattern("gather:communities:*")
        invalidate_feed()
        return {"status": "pending" if is_private_approval else "joined", "slug": slug}

    if existing.role == "pending":
        return {"status": "pending", "slug": slug}

    return {"status": "joined", "slug": slug}


@router.get("/feed/communities/{slug}/requests", response_model=list[JoinRequestResponse])
def get_pending_join_requests(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[JoinRequestResponse]:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    is_admin = (community.created_by_id == user.id) or (
        db.scalar(
            select(CommunityMember.role).where(
                CommunityMember.community_id == community.id,
                CommunityMember.user_id == user.id,
            )
        ) == "admin"
    )
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view join requests.")

    pending_rows = db.execute(
        select(CommunityMember, User)
        .join(User, CommunityMember.user_id == User.id)
        .where(
            CommunityMember.community_id == community.id,
            CommunityMember.role == "pending",
        )
        .order_by(CommunityMember.joined_at.desc())
    ).all()

    return [
        JoinRequestResponse(
            user_id=u.id,
            name=f"{u.first_name} {u.last_name}".strip() or u.username,
            username=u.username,
            avatar_url=u.avatar_url,
            requested_at=cm.joined_at,
        )
        for cm, u in pending_rows
    ]


@router.post("/feed/communities/{slug}/requests/{target_user_id}/approve")
def approve_join_request(
    slug: str,
    target_user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    is_admin = (community.created_by_id == user.id) or (
        db.scalar(
            select(CommunityMember.role).where(
                CommunityMember.community_id == community.id,
                CommunityMember.user_id == user.id,
            )
        ) == "admin"
    )
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can approve join requests.")

    membership = db.scalar(
        select(CommunityMember).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == target_user_id,
        )
    )
    if not membership:
        raise HTTPException(status_code=404, detail="Join request not found.")

    membership.role = "member"
    db.commit()
    cache.delete_pattern("gather:communities:*")
    invalidate_feed()
    return {"status": "approved", "user_id": str(target_user_id)}


@router.post("/feed/communities/{slug}/requests/{target_user_id}/reject")
def reject_join_request(
    slug: str,
    target_user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    is_admin = (community.created_by_id == user.id) or (
        db.scalar(
            select(CommunityMember.role).where(
                CommunityMember.community_id == community.id,
                CommunityMember.user_id == user.id,
            )
        ) == "admin"
    )
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can reject join requests.")

    membership = db.scalar(
        select(CommunityMember).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == target_user_id,
        )
    )
    if membership:
        db.delete(membership)
        db.commit()
        cache.delete_pattern("gather:communities:*")
        invalidate_feed()

    return {"status": "rejected", "user_id": str(target_user_id)}


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
        cache.delete_pattern("gather:communities:*")
        invalidate_feed()

    return {"status": "left", "slug": slug}


@router.post("/feed/communities/{slug}/avatar", response_model=CommunitySummary)
async def upload_community_avatar(
    slug: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommunitySummary:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Page not found")
    is_creator = community.created_by_id == user.id
    role = db.scalar(
        select(CommunityMember.role).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == user.id,
        )
    )
    if not (is_creator or role == "admin"):
        raise HTTPException(status_code=403, detail="Only page admins can update the page avatar")

    contents = await file.read()
    ext = validate_image_file(contents, file.content_type or "")
    filename = f"page_av_{secrets.token_hex(12)}{ext}"
    dest = POSTS_DIR / filename
    dest.write_bytes(contents)
    community.avatar_url = f"/uploads/posts/{filename}"
    db.commit()
    db.refresh(community)
    cache.delete_pattern("gather:communities:*")
    invalidate_feed()
    return _build_community_summary(community, user.id, db)


@router.post("/feed/communities/{slug}/banner", response_model=CommunitySummary)
async def upload_community_banner(
    slug: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommunitySummary:
    community = db.scalar(select(Community).where(Community.slug == slug.lower()))
    if not community:
        raise HTTPException(status_code=404, detail="Page not found")
    is_creator = community.created_by_id == user.id
    role = db.scalar(
        select(CommunityMember.role).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == user.id,
        )
    )
    if not (is_creator or role == "admin"):
        raise HTTPException(status_code=403, detail="Only page admins can update the page cover banner")

    contents = await file.read()
    ext = validate_image_file(contents, file.content_type or "")
    filename = f"page_cov_{secrets.token_hex(12)}{ext}"
    dest = POSTS_DIR / filename
    dest.write_bytes(contents)
    community.banner_url = f"/uploads/posts/{filename}"
    db.commit()
    db.refresh(community)
    cache.delete_pattern("gather:communities:*")
    invalidate_feed()
    return _build_community_summary(community, user.id, db)


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
    source: str | None = Query(default=None),  # 'watch' (for YouTube/Watch), 'feed', or None (all)
    sort: str = Query(default="new"),  # 'new', 'top'
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PostResponse]:
    cache_key = make_key("feed", feed_type, community_slug or "all", author_username or "all", source or "all", sort, limit, user.id)
    cached = cache.get_json(cache_key)
    if cached is not None:
        try:
            return [PostResponse.model_validate(p) for p in cached]
        except Exception:
            pass

    query = select(Post).join(Community)

    if source == "watch":
        query = query.where(Post.source == "watch", Post.video_url.isnot(None))
    elif source:
        query = query.where(Post.source == source)

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
    responses = [_build_post_response(post, user.id, db) for post in posts]
    cache.set_json(cache_key, [r.model_dump(mode="json") for r in responses], ex=30)
    return responses


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
    community = None
    if payload.community_id:
        community = db.scalar(select(Community).where(Community.id == payload.community_id))
    elif payload.community_slug and payload.community_slug.strip():
        community = db.scalar(select(Community).where(Community.slug == payload.community_slug.strip().lower()))

    # If community not found and video is being uploaded, check or auto-create user's creator channel
    if not community and payload.video_url:
        community = db.scalar(select(Community).where(Community.created_by_id == user.id))
        if not community:
            import re
            default_slug = re.sub(r'[^a-z0-9_]', '', user.username.lower()) or f"user_{user.id}"
            existing = db.scalar(select(Community).where(Community.slug == default_slug))
            if existing:
                default_slug = f"{default_slug}_{user.id}"
            channel_name = f"{user.first_name} {user.last_name}".strip() or user.username
            community = Community(
                name=channel_name,
                slug=default_slug,
                description=f"Official channel of @{user.username}",
                privacy_type="private",
                category="General",
                created_by_id=user.id,
            )
            db.add(community)
            db.flush()
            db.add(CommunityMember(community_id=community.id, user_id=user.id, role="admin"))
            db.commit()
            db.refresh(community)

    if not community:
        raise HTTPException(status_code=400, detail="Community is required")

    # Posting Permission Rules:
    # 1. Private Community: Only admin can post! (Admin can post text, images, and videos).
    # 2. Public Page: Open for all and every member can post text, images, and videos!
    is_creator = community.created_by_id == user.id
    role = db.scalar(
        select(CommunityMember.role).where(
            CommunityMember.community_id == community.id,
            CommunityMember.user_id == user.id,
        )
    )
    is_admin = is_creator or (role == "admin")

    if community.privacy_type == "private" and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="In a Private Community, only the Admin can create posts. Members can view, like, and comment.",
        )

    # In Public Page: every member can post. If not joined yet, auto-join as member
    if community.privacy_type == "public" and not role and not is_creator:
        db.add(CommunityMember(community_id=community.id, user_id=user.id, role="member"))
        db.commit()

    post = Post(
        community_id=community.id,
        author_id=user.id,
        title=payload.title,
        content=payload.content,
        image_url=payload.image_url,
        video_url=payload.video_url,
        source=payload.source or "feed",
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    invalidate_feed(post_id=post.id, community_slug=community.slug)
    return _build_post_response(post, user.id, db)


@router.post("/feed/posts/{post_id}/view")
def increment_post_view(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, int]:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if post:
        post.views_count = (post.views_count or 0) + 1
        db.commit()
        return {"views_count": post.views_count}
    return {"views_count": 0}


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

    invalidate_feed(post_id=post.id, community_slug=community.slug)
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

    slug = post.community.slug if post.community else None
    db.delete(post)
    db.commit()
    invalidate_feed(post_id=post_id, community_slug=slug)
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

    invalidate_feed(post_id=post_id)
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

    invalidate_feed(post_id=post_id)
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
    invalidate_feed(post_id=post.id)
    return {"status": "deleted", "comment_id": comment_id}

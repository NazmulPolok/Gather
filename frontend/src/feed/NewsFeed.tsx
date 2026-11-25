import { useState, useEffect, useRef, useMemo, type FormEvent } from 'react'
import {
  api,
  getMediaUrl,
  type AuthUser,
  type CommunitySummary,
  type JoinRequestItem,
  type PostItem,
} from '../api/client'
import { UserAvatar } from '../components/UserAvatar'

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = Date.now()
    const diffSec = Math.floor((now - date.getTime()) / 1000)
    if (diffSec < 45) return 'just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'recently'
  }
}

// Skeleton card for zero-layout-shift professional loading experience
function PostSkeleton() {
  return (
    <div className="pro-skeleton-card">
      <div className="pro-skeleton-header">
        <div className="pro-skeleton-avatar"></div>
        <div className="pro-skeleton-lines">
          <div className="pro-skeleton-line short"></div>
          <div className="pro-skeleton-line tiny"></div>
        </div>
      </div>
      <div className="pro-skeleton-line title"></div>
      <div className="pro-skeleton-line"></div>
      <div className="pro-skeleton-line medium"></div>
      <div className="pro-skeleton-media"></div>
      <div className="pro-skeleton-footer">
        <div className="pro-skeleton-pill"></div>
        <div className="pro-skeleton-pill"></div>
        <div className="pro-skeleton-pill"></div>
      </div>
    </div>
  )
}

export function NewsFeed({
  token,
  user,
  onOpenGroupChat,
  onOpenProfile,
}: {
  token: string
  user: AuthUser
  onOpenGroupChat?: () => void
  onOpenProfile?: (username: string) => void
}) {
  const [communities, setCommunities] = useState<CommunitySummary[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Feeds & Community navigation
  const [feedType, setFeedType] = useState<'all' | 'home'>('all')
  const [selectedCommunitySlug, setSelectedCommunitySlug] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'new' | 'top' | 'media'>('new')

  // Create Modal state (Public Page vs Private Community)
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunitySlug, setNewCommunitySlug] = useState('')
  const [newCommunityDesc, setNewCommunityDesc] = useState('')
  const [newType, setNewType] = useState<'public' | 'private'>('public')
  const [newJoinRule, setNewJoinRule] = useState<'open' | 'approval'>('open')
  const [newCategory, setNewCategory] = useState<string>('General')
  const [creatingCommunity, setCreatingCommunity] = useState(false)
  const [createCommunityError, setCreateCommunityError] = useState('')

  // Join Requests Modal state (for Private Community Admin)
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<JoinRequestItem[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Create Post
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [targetCommunitySlug, setTargetCommunitySlug] = useState<string>('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({})

  // Post inline edit
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Image lightbox
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null)

  // 1. Fetch Communities
  useEffect(() => {
    let live = true
    api.getCommunities(token)
      .then(res => {
        if (!live) return
        setCommunities(res)
        if (res.length > 0 && !targetCommunitySlug) {
          setTargetCommunitySlug(res[0].slug)
        }
      })
      .catch(err => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load communities')
      })
    return () => { live = false }
  }, [token])

  // 2. Fetch Feed
  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    api.getNewsFeed(token, {
      feed_type: selectedCommunitySlug ? undefined : feedType,
      community_slug: selectedCommunitySlug || undefined,
      sort: sortBy === 'media' ? 'new' : sortBy,
    })
      .then(res => {
        if (live) setPosts(res)
      })
      .catch(err => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load feed')
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => { live = false }
  }, [token, feedType, selectedCommunitySlug, sortBy === 'media' ? 'new' : sortBy])

  // Current selected community object
  const currentCommunity = useMemo(() => {
    return selectedCommunitySlug ? communities.find(c => c.slug === selectedCommunitySlug) || null : null
  }, [communities, selectedCommunitySlug])

  // Filtered posts based on active tab
  const displayPosts = useMemo(() => {
    if (sortBy === 'media') {
      return posts.filter(p => Boolean(p.video_url || p.image_url))
    }
    return posts
  }, [posts, sortBy])

  // Other recommended spaces
  const recommendedCommunities = useMemo(() => {
    return communities.filter(c => c.slug !== selectedCommunitySlug).slice(0, 4)
  }, [communities, selectedCommunitySlug])

  // Handle Join / Leave / Pending request
  async function handleToggleJoinCommunity(slug: string, isMember: boolean, isPending: boolean = false) {
    try {
      if (isPending) {
        await api.leaveCommunity(token, slug)
        setCommunities(curr =>
          curr.map(c => c.slug === slug ? { ...c, is_pending: false, is_member: false } : c)
        )
        setNotice('Join request cancelled.')
        setTimeout(() => setNotice(''), 3000)
        return
      }

      if (isMember) {
        await api.leaveCommunity(token, slug)
        setCommunities(curr =>
          curr.map(c =>
            c.slug === slug
              ? { ...c, is_member: false, is_admin: false, is_pending: false, member_count: Math.max(0, c.member_count - 1) }
              : c
          )
        )
        setNotice('You left this space.')
        setTimeout(() => setNotice(''), 3000)
      } else {
        const res = await api.joinCommunity(token, slug)
        if (res.status === 'pending') {
          setCommunities(curr =>
            curr.map(c => c.slug === slug ? { ...c, is_pending: true } : c)
          )
          setNotice('Join request submitted! Awaiting admin approval.')
        } else {
          setCommunities(curr =>
            curr.map(c =>
              c.slug === slug
                ? { ...c, is_member: true, is_pending: false, member_count: c.member_count + 1 }
                : c
            )
          )
          setNotice('Welcome! You joined this space.')
        }
        setTimeout(() => setNotice(''), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update membership')
    }
  }

  // Open Requests Modal
  async function handleOpenRequestsModal(slug: string) {
    setShowRequestsModal(true)
    setLoadingRequests(true)
    try {
      const list = await api.getJoinRequests(token, slug)
      setPendingRequests(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  async function handleApproveRequest(slug: string, userId: number) {
    try {
      await api.approveJoinRequest(token, slug, userId)
      setPendingRequests(prev => prev.filter(r => r.user_id !== userId))
      setCommunities(curr =>
        curr.map(c =>
          c.slug === slug
            ? {
                ...c,
                member_count: c.member_count + 1,
                pending_requests_count: Math.max(0, (c.pending_requests_count || 1) - 1),
              }
            : c
        )
      )
      setNotice('Member approved!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not approve request')
    }
  }

  async function handleRejectRequest(slug: string, userId: number) {
    try {
      await api.rejectJoinRequest(token, slug, userId)
      setPendingRequests(prev => prev.filter(r => r.user_id !== userId))
      setCommunities(curr =>
        curr.map(c =>
          c.slug === slug
            ? {
                ...c,
                pending_requests_count: Math.max(0, (c.pending_requests_count || 1) - 1),
              }
            : c
        )
      )
      setNotice('Request declined.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reject request')
    }
  }

  // Handle Create Public Page or Private Community
  async function handleCreateCommunitySubmit(e: FormEvent) {
    e.preventDefault()
    if (!newCommunityName.trim() || !newCommunitySlug.trim()) {
      setCreateCommunityError('Name and URL slug are required.')
      return
    }
    setCreatingCommunity(true)
    setCreateCommunityError('')
    try {
      const created = await api.createCommunity(
        token,
        newCommunityName.trim(),
        newCommunitySlug.trim().toLowerCase(),
        newCommunityDesc.trim() || undefined,
        newType,
        newJoinRule,
        newCategory
      )
      setCommunities(curr => [created, ...curr])
      setShowCreateCommunity(false)
      setNewCommunityName('')
      setNewCommunitySlug('')
      setNewCommunityDesc('')
      setSelectedCommunitySlug(created.slug)
      setTargetCommunitySlug(created.slug)
      setNotice(`"${created.name}" created successfully!`)
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      setCreateCommunityError(err instanceof Error ? err.message : 'Could not create space')
    } finally {
      setCreatingCommunity(false)
    }
  }

  // Image / Video selection
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachedImage(file)
    const preview = URL.createObjectURL(file)
    setAttachedPreview(preview)
  }

  function clearImage() {
    setAttachedImage(null)
    if (attachedPreview) URL.revokeObjectURL(attachedPreview)
    setAttachedPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handle Create Post
  async function handleCreatePost(e: FormEvent) {
    e.preventDefault()
    const title = postTitle.trim()
    if (!title) {
      setError('Post title is required.')
      return
    }
    const slug = targetCommunitySlug || selectedCommunitySlug || communities[0]?.slug
    if (!slug) {
      setError('Please select a space to post in.')
      return
    }

    setSubmittingPost(true)
    setError('')
    try {
      let imageUrl: string | undefined
      let videoUrl: string | undefined
      if (attachedImage) {
        const uploadRes = await api.uploadPostImage(token, attachedImage)
        if (uploadRes.video_url) {
          videoUrl = uploadRes.video_url
        } else {
          imageUrl = uploadRes.image_url
        }
      }
      const newPost = await api.createPost(token, {
        community_slug: slug,
        title,
        content: postContent.trim() || undefined,
        image_url: imageUrl,
        video_url: videoUrl,
        source: 'feed',
      })
      setPosts(curr => [newPost, ...curr])
      setPostTitle('')
      setPostContent('')
      clearImage()
      setNotice(`Post published to ${newPost.community.privacy_type === 'public' ? 'p/' : 'c/'}${slug}!`)
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit post')
    } finally {
      setSubmittingPost(false)
    }
  }

  // Handle Upvote
  async function handleToggleUpvote(postId: number) {
    setPosts(curr =>
      curr.map(p => {
        if (p.id === postId) {
          const nextVoted = !p.has_upvoted
          return {
            ...p,
            has_upvoted: nextVoted,
            upvote_count: nextVoted ? p.upvote_count + 1 : Math.max(0, p.upvote_count - 1),
          }
        }
        return p
      })
    )
    try {
      const res = await api.togglePostReact(token, postId)
      setPosts(curr =>
        curr.map(p =>
          p.id === postId
            ? { ...p, has_upvoted: res.has_upvoted, upvote_count: res.upvote_count }
            : p
        )
      )
    } catch {
      // Revert on failure
      setPosts(curr =>
        curr.map(p => {
          if (p.id === postId) {
            const prevVoted = !p.has_upvoted
            return {
              ...p,
              has_upvoted: prevVoted,
              upvote_count: prevVoted ? p.upvote_count + 1 : Math.max(0, p.upvote_count - 1),
            }
          }
          return p
        })
      )
    }
  }

  // Inline edit
  function startEditPost(post: PostItem) {
    setEditingPostId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content || '')
  }

  async function handleSaveEdit(postId: number) {
    if (!editTitle.trim()) {
      setError('Title cannot be empty')
      return
    }
    try {
      const updated = await api.editPost(token, postId, {
        title: editTitle.trim(),
        content: editContent.trim() || undefined,
      })
      setPosts(curr => curr.map(p => (p.id === postId ? { ...p, ...updated } : p)))
      setEditingPostId(null)
      setNotice('Post updated successfully.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update post')
    }
  }

  async function handleDeletePost(postId: number) {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await api.deletePost(token, postId)
      setPosts(curr => curr.filter(p => p.id !== postId))
      setNotice('Post deleted.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete post')
    }
  }

  // Comments
  function toggleComments(postId: number) {
    setExpandedComments(curr => ({ ...curr, [postId]: !curr[postId] }))
  }

  async function handleAddComment(postId: number) {
    const text = (commentInputs[postId] || '').trim()
    if (!text) return
    setSubmittingComment(curr => ({ ...curr, [postId]: true }))
    try {
      const newComment = await api.createComment(token, postId, text)
      setPosts(curr =>
        curr.map(p =>
          p.id === postId
            ? {
                ...p,
                comment_count: p.comment_count + 1,
                comments: [...p.comments, newComment],
              }
            : p
        )
      )
      setCommentInputs(curr => ({ ...curr, [postId]: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post comment')
    } finally {
      setSubmittingComment(curr => ({ ...curr, [postId]: false }))
    }
  }

  async function handleDeleteComment(postId: number, commentId: number) {
    try {
      await api.deleteComment(token, commentId)
      setPosts(curr =>
        curr.map(p =>
          p.id === postId
            ? {
                ...p,
                comment_count: Math.max(0, p.comment_count - 1),
                comments: p.comments.filter(c => c.id !== commentId),
              }
            : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete comment')
    }
  }

  return (
    <div className="feed-layout-container">
      {/* ====================================================
          LEFT SIDEBAR: Spaces & Feed Navigation
          ==================================================== */}
      <aside className="feed-left-sidebar">
        <div className="pro-sidebar-section">
          <span className="feed-sidebar-title">DISCOVERY FEEDS</span>
          <div className="feed-filter-menu">
            <button
              type="button"
              className={`feed-filter-btn ${!selectedCommunitySlug && feedType === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCommunitySlug(null)
                setFeedType('all')
              }}
            >
              <span className="feed-filter-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
              </span>
              <div className="feed-filter-copy">
                <strong>Explore Feed</strong>
                <small>Trending across all spaces</small>
              </div>
            </button>

            <button
              type="button"
              className={`feed-filter-btn ${!selectedCommunitySlug && feedType === 'home' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCommunitySlug(null)
                setFeedType('home')
              }}
            >
              <span className="feed-filter-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <div className="feed-filter-copy">
                <strong>My Feed</strong>
                <small>Joined pages & communities</small>
              </div>
            </button>
          </div>
        </div>

        <div className="pro-sidebar-section" style={{ marginTop: '6px' }}>
          <div className="pro-sidebar-header-row">
            <span className="feed-sidebar-title" style={{ padding: 0 }}>PAGES & SPACES</span>
            <button
              type="button"
              className="pro-create-space-pill-btn"
              onClick={() => setShowCreateCommunity(true)}
              title="Create a Public Page or Private Community"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Create</span>
            </button>
          </div>

          <div className="feed-filter-menu custom-scrollbar" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {communities.map(comm => {
              const isPrivate = comm.privacy_type === 'private'
              const isSelected = selectedCommunitySlug === comm.slug
              return (
                <button
                  key={comm.id}
                  type="button"
                  className={`feed-filter-btn space-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCommunitySlug(comm.slug)}
                >
                  <div className={`space-avatar-circle ${isPrivate ? 'private' : 'public'}`}>
                    {(comm.name || comm.slug)[0].toUpperCase()}
                  </div>
                  <div className="feed-filter-copy">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <strong className="space-name-text">{comm.name}</strong>
                      <span className={`comm-type-pill ${isPrivate ? 'private' : 'public'}`}>
                        {isPrivate ? 'Community' : 'Page'}
                      </span>
                    </div>
                    <small className="space-subtext">
                      {isPrivate ? 'c/' : 'p/'}{comm.slug} • {comm.member_count} {comm.member_count === 1 ? 'member' : 'members'}
                    </small>
                  </div>
                </button>
              )
            })}
            {communities.length === 0 && (
              <div className="empty-sidebar-spaces">
                <p>No spaces created yet.</p>
                <button type="button" onClick={() => setShowCreateCommunity(true)}>
                  + Create First Space
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ====================================================
          CENTER MAIN FEED & POST COMPOSER
          ==================================================== */}
      <main className="feed-main-stream">
        {/* Banner Alert Notices */}
        {notice && (
          <div className="feed-banner-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="feed-banner-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Close error">✕</button>
          </div>
        )}

        {/* Selected Community / Page Header Banner (Pro Redesign) */}
        {currentCommunity && (
          <div className="pro-community-banner">
            <div className="pro-community-banner-top">
              <div className={`pro-banner-avatar ${currentCommunity.privacy_type === 'private' ? 'private' : 'public'}`}>
                {(currentCommunity.name || currentCommunity.slug)[0].toUpperCase()}
              </div>
              <div className="pro-banner-meta">
                <div className="pro-banner-title-line">
                  <h2>{currentCommunity.name}</h2>
                  <span className={`reddit-type-tag ${currentCommunity.privacy_type === 'private' ? 'private' : 'public'}`}>
                    {currentCommunity.privacy_type === 'private' ? '🔒 Private Community' : '🌐 Public Page'}
                  </span>
                  {currentCommunity.privacy_type === 'private' && (
                    <span className="reddit-rule-tag">
                      {currentCommunity.join_rule === 'approval' ? 'Requires Approval' : 'Instant Access'}
                    </span>
                  )}
                </div>
                <div className="pro-banner-sub-meta">
                  <span className="pro-banner-slug">
                    {currentCommunity.privacy_type === 'private' ? 'c/' : 'p/'}{currentCommunity.slug}
                  </span>
                  <span>•</span>
                  <span>{currentCommunity.category || 'General'}</span>
                  <span>•</span>
                  <span>{currentCommunity.member_count} {currentCommunity.member_count === 1 ? 'member' : 'members'}</span>
                  <span>•</span>
                  <span className="pro-banner-rule-pill">
                    {currentCommunity.privacy_type === 'private' ? 'Admin Publishing Only' : 'Open Posting for All'}
                  </span>
                </div>
                <p className="pro-banner-desc">
                  {currentCommunity.description || (currentCommunity.privacy_type === 'public'
                    ? 'Welcome to this public page! Members can share discussions, photos, and videos.'
                    : 'Welcome to this private community! Admins publish curated posts and members interact.')}
                </p>
              </div>
            </div>

            <div className="pro-banner-actions-row">
              {currentCommunity.is_member ? (
                <button
                  type="button"
                  className="pro-action-btn joined"
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Joined</span>
                </button>
              ) : currentCommunity.is_pending ? (
                <button
                  type="button"
                  className="pro-action-btn pending"
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, false, true)}
                  title="Click to cancel join request"
                >
                  <span className="spinner-dot"></span>
                  <span>Pending (Cancel)</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="pro-action-btn primary"
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, false)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>
                    {currentCommunity.privacy_type === 'private' && currentCommunity.join_rule === 'approval'
                      ? 'Request to Join'
                      : `Join ${currentCommunity.privacy_type === 'public' ? 'Page' : 'Community'}`}
                  </span>
                </button>
              )}

              {/* Admin Requests Button */}
              {currentCommunity.is_admin && currentCommunity.privacy_type === 'private' && (
                <button
                  type="button"
                  className="pro-action-btn secondary"
                  onClick={() => handleOpenRequestsModal(currentCommunity.slug)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Member Requests {(currentCommunity.pending_requests_count ?? 0) > 0 ? `(${currentCommunity.pending_requests_count})` : ''}</span>
                </button>
              )}

              <button
                type="button"
                className="pro-action-btn ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  setNotice('Space link copied to clipboard!')
                  setTimeout(() => setNotice(''), 3000)
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        )}

        {/* Pro Filter & Sort Tabs */}
        <div className="pro-filter-bar">
          <div className="pro-filter-tabs">
            <button
              type="button"
              className={`pro-tab-btn ${sortBy === 'new' ? 'active' : ''}`}
              onClick={() => setSortBy('new')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Recent</span>
            </button>
            <button
              type="button"
              className={`pro-tab-btn ${sortBy === 'top' ? 'active' : ''}`}
              onClick={() => setSortBy('top')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Top Voted</span>
            </button>
            <button
              type="button"
              className={`pro-tab-btn ${sortBy === 'media' ? 'active' : ''}`}
              onClick={() => setSortBy('media')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <span>Media Only</span>
            </button>
          </div>

          <div className="pro-filter-status">
            <span>{displayPosts.length} {displayPosts.length === 1 ? 'post' : 'posts'}</span>
          </div>
        </div>

        {/* Post Composer Card (Pro Redesign) */}
        {(() => {
          const targetComm = communities.find(c => c.slug === (targetCommunitySlug || selectedCommunitySlug || communities[0]?.slug))
          const isTargetPrivate = targetComm?.privacy_type === 'private'
          const canPost = targetComm ? (targetComm.can_post ?? (isTargetPrivate ? targetComm.is_admin : true)) : true

          return (
            <section className="pro-composer-card">
              <div className="pro-composer-header">
                <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} size={40} />
                <div className="pro-composer-dest">
                  <span className="pro-composer-user-name">{user.nickname || user.username}</span>
                  <div className="pro-composer-select-pill">
                    <span>Posting in:</span>
                    <select
                      className="pro-composer-dropdown"
                      value={targetCommunitySlug || targetComm?.slug || ''}
                      onChange={e => setTargetCommunitySlug(e.target.value)}
                    >
                      {communities.map(comm => (
                        <option key={comm.id} value={comm.slug}>
                          {comm.privacy_type === 'private' ? '🔒 Community: ' : '🌐 Page: '}
                          {comm.name} ({comm.privacy_type === 'private' ? 'c/' : 'p/'}{comm.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Locked Notice for Regular Members in Private Community */}
              {isTargetPrivate && !canPost ? (
                <div className="pro-composer-locked-box">
                  <div className="pro-locked-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div className="pro-locked-content">
                    <strong>Admin-Curated Community ({targetComm?.name})</strong>
                    <p>
                      In this Private Community, only Admins can publish posts and media. You can freely read, upvote, and comment on discussions below.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="pro-composer-form" onSubmit={handleCreatePost}>
                  <div className="pro-composer-input-group">
                    <input
                      type="text"
                      placeholder="Title of your post..."
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      className="pro-composer-title-input"
                      maxLength={300}
                      required
                    />
                    <textarea
                      placeholder="Share your thoughts, ask a question, or describe your media..."
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      className="pro-composer-body-textarea"
                      rows={2}
                    />
                  </div>

                  {/* Attached Media Preview Box */}
                  {attachedPreview && (
                    <div className="pro-composer-media-preview">
                      {attachedImage?.type.startsWith('video/') ? (
                        <video
                          src={attachedPreview}
                          controls
                          playsInline
                          className="pro-composer-media-element"
                        />
                      ) : (
                        <img src={attachedPreview} alt="Upload preview" className="pro-composer-media-element" />
                      )}
                      <button type="button" className="pro-remove-attachment-btn" onClick={clearImage}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>Remove</span>
                      </button>
                    </div>
                  )}

                  <div className="pro-composer-footer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi"
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                    />

                    <div className="pro-composer-media-actions">
                      <button
                        type="button"
                        className="pro-media-pill-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>Photo</span>
                      </button>

                      <button
                        type="button"
                        className="pro-media-pill-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        <span>Video</span>
                      </button>
                    </div>

                    <div className="pro-composer-submit-wrap">
                      <span className="pro-composer-badge">
                        {isTargetPrivate ? '★ Admin Post' : '🌐 Open Page'}
                      </span>
                      <button
                        type="submit"
                        className="pro-publish-submit-btn"
                        disabled={submittingPost || !postTitle.trim()}
                      >
                        {submittingPost ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }}></span>
                            Publishing…
                          </span>
                        ) : (
                          <span>Publish Post</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </section>
          )
        })()}

        {/* Posts Stream */}
        {loading ? (
          <div className="pro-skeleton-feed">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="pro-feed-empty-card">
            <div className="pro-empty-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>No posts found in this feed</h3>
            <p>
              {selectedCommunitySlug
                ? `Be the first one to share an update, photo, or discussion in this space!`
                : `Join pages and communities or share your first post to populate your feed.`}
            </p>
          </div>
        ) : (
          <div className="pro-feed-cards-stack">
            {displayPosts.map(post => {
              const isAuthor = post.author.user_id === user.id
              const isOP = post.author.user_id === post.community.id // or creator
              return (
                <article key={post.id} className="pro-post-card">
                  {/* Post Top Header */}
                  <div className="pro-post-header">
                    <div className="pro-post-header-left">
                      <div
                        className={`pro-post-space-chip ${post.community.privacy_type === 'private' ? 'private' : 'public'}`}
                        onClick={() => setSelectedCommunitySlug(post.community.slug)}
                        title={`View ${post.community.name}`}
                      >
                        <span className="space-chip-icon">
                          {post.community.privacy_type === 'private' ? '🔒' : '🌐'}
                        </span>
                        <strong className="space-chip-slug">
                          {post.community.privacy_type === 'private' ? 'c/' : 'p/'}{post.community.slug}
                        </strong>
                      </div>

                      <span className="pro-meta-dot">•</span>

                      <div className="pro-author-meta">
                        <UserAvatar avatarUrl={post.author.avatar_url} fallback={post.author.username} size={24} />
                        <span
                          className="pro-author-link"
                          style={onOpenProfile ? { cursor: 'pointer' } : undefined}
                          onClick={() => onOpenProfile?.(post.author.username)}
                          title={`View ${post.author.username}'s profile`}
                        >
                          @{post.author.username}
                        </span>
                      </div>

                      <span className="pro-meta-dot">•</span>
                      <span className="pro-post-time">{formatRelativeTime(post.created_at)}</span>

                      {post.updated_at && <span className="pro-edited-tag">(edited)</span>}
                      {post.source === 'watch' && (
                        <span className="pro-watch-source-pill">🎬 Watch Video</span>
                      )}
                    </div>

                    {/* Author Post Actions */}
                    {isAuthor && (
                      <div className="pro-post-actions-menu">
                        <button
                          type="button"
                          className="pro-post-icon-btn edit"
                          onClick={() => startEditPost(post)}
                          title="Edit post"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="pro-post-icon-btn delete"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete post"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Post Editor */}
                  {editingPostId === post.id ? (
                    <div className="pro-post-inline-editor">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="pro-inline-edit-input"
                      />
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="pro-inline-edit-textarea"
                        rows={3}
                      />
                      <div className="pro-inline-edit-actions">
                        <button
                          type="button"
                          className="pro-btn-secondary"
                          onClick={() => setEditingPostId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="pro-btn-primary"
                          onClick={() => handleSaveEdit(post.id)}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Post Title */}
                      <h3 className="pro-post-title">{post.title}</h3>

                      {/* Post Content */}
                      {post.content && (
                        <p className="pro-post-body-text">{post.content}</p>
                      )}

                      {/* Post Media: Image */}
                      {post.image_url && (
                        <div
                          className="pro-post-media-frame"
                          onClick={() => setFullImageUrl(getMediaUrl(post.image_url))}
                        >
                          <img src={getMediaUrl(post.image_url)} alt={post.title} loading="lazy" />
                          <div className="pro-media-zoom-pill">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              <line x1="11" y1="8" x2="11" y2="14"></line>
                              <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                            <span>Click to enlarge</span>
                          </div>
                        </div>
                      )}

                      {/* Post Media: Video */}
                      {post.video_url && (
                        <div className="pro-post-video-container">
                          <video
                            src={getMediaUrl(post.video_url)}
                            controls
                            playsInline
                            preload="metadata"
                            className="pro-post-video-player"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Post Bottom Toolbar */}
                  <div className="pro-post-toolbar">
                    <button
                      type="button"
                      className={`pro-toolbar-pill vote ${post.has_upvoted ? 'active-voted' : ''}`}
                      onClick={() => handleToggleUpvote(post.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={post.has_upvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      <strong>{post.upvote_count}</strong>
                      <span>{post.upvote_count === 1 ? 'Upvote' : 'Upvotes'}</span>
                    </button>

                    <button
                      type="button"
                      className={`pro-toolbar-pill comments ${expandedComments[post.id] ? 'active-comments' : ''}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <strong>{post.comment_count}</strong>
                      <span>{post.comment_count === 1 ? 'Comment' : 'Comments'}</span>
                    </button>

                    {(post.views_count ?? 0) > 0 && (
                      <div className="pro-toolbar-pill views">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>{post.views_count} views</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="pro-toolbar-pill share"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href)
                        setNotice('Post link copied!')
                        setTimeout(() => setNotice(''), 3000)
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Thread Drawer */}
                  {expandedComments[post.id] && (
                    <div className="pro-comments-drawer">
                      <div className="pro-comments-list">
                        {post.comments.map(c => (
                          <div key={c.id} className="pro-comment-item">
                            <UserAvatar
                              avatarUrl={c.author.avatar_url}
                              fallback={c.author.username}
                              size={32}
                            />
                            <div className="pro-comment-bubble">
                              <div className="pro-comment-head">
                                <span
                                  className="pro-comment-author"
                                  style={onOpenProfile ? { cursor: 'pointer' } : undefined}
                                  onClick={() => onOpenProfile?.(c.author.username)}
                                  title={`View ${c.author.username}'s profile`}
                                >
                                  @{c.author.username}
                                </span>
                                <span className="pro-comment-time">
                                  {formatRelativeTime(c.created_at)}
                                </span>
                                {(c.author.user_id === user.id || post.author.user_id === user.id) && (
                                  <button
                                    type="button"
                                    className="pro-comment-delete-btn"
                                    onClick={() => handleDeleteComment(post.id, c.id)}
                                    title="Delete comment"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <p className="pro-comment-text">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        {post.comments.length === 0 && (
                          <div className="pro-comments-empty">
                            <span>💬</span> No comments yet. Be the first to start the conversation!
                          </div>
                        )}
                      </div>

                      {/* Comment Composer */}
                      <div className="pro-comment-compose-row">
                        <UserAvatar avatarUrl={user.avatar_url} fallback={user.username} size={30} />
                        <div className="pro-comment-input-wrap">
                          <input
                            type="text"
                            placeholder="Write a thoughtful comment…"
                            className="pro-comment-input"
                            value={commentInputs[post.id] || ''}
                            onChange={e =>
                              setCommentInputs(curr => ({ ...curr, [post.id]: e.target.value }))
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddComment(post.id)
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="pro-comment-send-btn"
                            disabled={submittingComment[post.id] || !(commentInputs[post.id] || '').trim()}
                            onClick={() => handleAddComment(post.id)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* ====================================================
          RIGHT SIDEBAR: Space Info & Platform Discovery
          ==================================================== */}
      <aside className="feed-right-sidebar">
        {currentCommunity ? (
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-card-header">
              <span className="pro-card-title">
                {currentCommunity.privacy_type === 'public' ? 'About this Page' : 'About this Community'}
              </span>
              <span className={`comm-type-pill ${currentCommunity.privacy_type === 'private' ? 'private' : 'public'}`}>
                {currentCommunity.privacy_type === 'private' ? 'Community' : 'Page'}
              </span>
            </div>

            <p className="pro-sidebar-about-text">
              {currentCommunity.description || (currentCommunity.privacy_type === 'public'
                ? 'Welcome to this public page! All members can create posts, share images, videos, and discussions.'
                : 'Welcome to this private community! Only admins can post content. Members can view, like, and comment.')}
            </p>

            <div className="pro-sidebar-rule-box">
              {currentCommunity.privacy_type === 'public' ? (
                <div>
                  <strong>👥 Posting Rule:</strong> Open for all members to publish text, photos, and videos.
                </div>
              ) : (
                <div>
                  <strong>🔒 Posting Rule:</strong> <em>Admin only</em>. Members can read, like, and comment.
                  <div style={{ marginTop: '4px' }}>
                    <strong>Access:</strong> {currentCommunity.join_rule === 'approval' ? 'Admin approval required' : 'Open for anyone to join'}
                  </div>
                </div>
              )}
            </div>

            <div className="pro-sidebar-stats-grid">
              <div className="pro-stat-box">
                <strong>{currentCommunity.member_count}</strong>
                <small>Members</small>
              </div>
              <div className="pro-stat-box">
                <strong>{currentCommunity.category || 'General'}</strong>
                <small>Category</small>
              </div>
            </div>

            {/* Admin Requests Button */}
            {currentCommunity.is_admin && currentCommunity.privacy_type === 'private' && (
              <button
                type="button"
                className="reddit-admin-requests-btn"
                onClick={() => handleOpenRequestsModal(currentCommunity.slug)}
              >
                👥 Member Requests {(currentCommunity.pending_requests_count ?? 0) > 0 ? `(${currentCommunity.pending_requests_count})` : ''}
              </button>
            )}

            <button
              type="button"
              className={`pro-sidebar-main-btn ${currentCommunity.is_pending ? 'pending' : currentCommunity.is_member ? 'leave' : 'join'}`}
              onClick={() => handleToggleJoinCommunity(currentCommunity.slug, currentCommunity.is_member, currentCommunity.is_pending)}
            >
              {currentCommunity.is_pending
                ? '⏳ Request Pending (Cancel)'
                : currentCommunity.is_member
                ? `Leave ${currentCommunity.privacy_type === 'public' ? 'Page' : 'Community'}`
                : `+ Join ${currentCommunity.privacy_type === 'public' ? 'Page' : (currentCommunity.join_rule === 'approval' ? ' (Request to Join)' : 'Community')}`}
            </button>

            {onOpenGroupChat && (
              <button
                type="button"
                className="pro-sidebar-chat-btn"
                onClick={onOpenGroupChat}
              >
                💬 Open Messenger Chat
              </button>
            )}
          </div>
        ) : (
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-card-header">
              <span className="pro-card-title">Pages & Communities</span>
              <span className="comm-type-pill public">Explore</span>
            </div>
            <p className="pro-sidebar-about-text">
              Discover Public Pages where members share posts, and Private Communities where creators publish curated updates!
            </p>
            <div className="pro-sidebar-stats-grid">
              <div className="pro-stat-box">
                <strong>{communities.length}</strong>
                <small>Total Spaces</small>
              </div>
              <div className="pro-stat-box">
                <strong>{posts.length}</strong>
                <small>Posts loaded</small>
              </div>
            </div>
            <button
              type="button"
              className="pro-sidebar-main-btn join"
              onClick={() => setShowCreateCommunity(true)}
            >
              + Create a Space
            </button>
            {onOpenGroupChat && (
              <button
                type="button"
                className="pro-sidebar-chat-btn"
                onClick={onOpenGroupChat}
              >
                💬 Open Messenger Chat
              </button>
            )}
          </div>
        )}

        {/* Recommended Spaces widget */}
        {recommendedCommunities.length > 0 && (
          <div className="pro-sidebar-card">
            <span className="pro-card-title">Discover Spaces</span>
            <div className="pro-recommended-list">
              {recommendedCommunities.map(rc => (
                <div key={rc.id} className="pro-recommended-item">
                  <div
                    className="pro-recommended-info"
                    onClick={() => setSelectedCommunitySlug(rc.slug)}
                  >
                    <div className={`space-avatar-circle small ${rc.privacy_type === 'private' ? 'private' : 'public'}`}>
                      {(rc.name || rc.slug)[0].toUpperCase()}
                    </div>
                    <div>
                      <strong className="rec-name">{rc.name}</strong>
                      <small className="rec-sub">{rc.privacy_type === 'private' ? 'c/' : 'p/'}{rc.slug} • {rc.member_count} members</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rec-join-btn"
                    onClick={() => handleToggleJoinCommunity(rc.slug, rc.is_member, rc.is_pending)}
                  >
                    {rc.is_member ? '✓' : '+'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Guidelines widget */}
        <div className="pro-sidebar-card">
          <span className="pro-card-title">Community Guidelines</span>
          <div className="pro-guidelines-list">
            <div className="pro-guideline-item">
              <span className="pro-guideline-num">1</span>
              <div>
                <strong>Public Page:</strong> Open for all. Any member can publish text, photos, and videos.
              </div>
            </div>
            <div className="pro-guideline-item">
              <span className="pro-guideline-num">2</span>
              <div>
                <strong>Private Community:</strong> Admin-only publishing. Members can read, react, and comment.
              </div>
            </div>
            <div className="pro-guideline-item">
              <span className="pro-guideline-num">3</span>
              <div>
                <strong>Respectful interaction:</strong> Constructive conversations and helpful feedback.
              </div>
            </div>
          </div>
          <div className="pro-sidebar-footer-links">
            <span>Gather Social © 2026</span>
          </div>
        </div>
      </aside>

      {/* ====================================================
          MODAL: Create Page or Community (Professional Modal)
          ==================================================== */}
      {showCreateCommunity && (
        <div className="modal-overlay" onClick={() => setShowCreateCommunity(false)}>
          <div className="pro-space-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="pro-modal-header">
              <div className="pro-modal-header-text">
                <h3 className="pro-modal-title">Create a Space</h3>
                <p className="pro-modal-subtitle">
                  {newType === 'public'
                    ? 'Create a public page where all members can share discussions, photos, and videos.'
                    : 'Create a private community where admins publish curated posts and members interact.'}
                </p>
              </div>
              <button
                type="button"
                className="pro-modal-close-btn"
                onClick={() => setShowCreateCommunity(false)}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {createCommunityError && (
              <div className="comment-error-alert" style={{ margin: '14px 22px 0' }}>
                {createCommunityError}
              </div>
            )}

            <form onSubmit={handleCreateCommunitySubmit} className="pro-modal-form">
              {/* Type Selection: Public Page vs Private Community */}
              <div className="space-type-grid">
                <div
                  className={`space-type-card ${newType === 'public' ? 'selected' : ''}`}
                  onClick={() => setNewType('public')}
                >
                  <div className="space-type-top">
                    <div className="space-type-icon-box public">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <div className="space-type-radio-indicator">
                      {newType === 'public' && <div className="space-type-radio-inner" />}
                    </div>
                  </div>
                  <div className="space-type-content">
                    <div className="space-type-title-row">
                      <span className="space-type-name">Public Page</span>
                      <span className="space-type-pill public">Open to All</span>
                    </div>
                    <p className="space-type-description">
                      Anyone can join directly. Every member can freely create posts, upload photos, and share videos.
                    </p>
                  </div>
                </div>

                <div
                  className={`space-type-card ${newType === 'private' ? 'selected' : ''}`}
                  onClick={() => setNewType('private')}
                >
                  <div className="space-type-top">
                    <div className="space-type-icon-box private">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <div className="space-type-radio-indicator">
                      {newType === 'private' && <div className="space-type-radio-inner" />}
                    </div>
                  </div>
                  <div className="space-type-content">
                    <div className="space-type-title-row">
                      <span className="space-type-name">Private Community</span>
                      <span className="space-type-pill private">Admin Only</span>
                    </div>
                    <p className="space-type-description">
                      Only Admins can publish posts and media. Members can view, upvote, comment, and engage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Private Community Membership Rule Selector */}
              {newType === 'private' && (
                <div className="pro-membership-group">
                  <span className="pro-input-label">Membership Access Policy</span>
                  <div className="pro-policy-options">
                    <label
                      className={`pro-policy-card ${newJoinRule === 'open' ? 'active' : ''}`}
                      onClick={() => setNewJoinRule('open')}
                    >
                      <input
                        type="radio"
                        name="joinRule"
                        value="open"
                        checked={newJoinRule === 'open'}
                        onChange={() => setNewJoinRule('open')}
                        style={{ display: 'none' }}
                      />
                      <div className="pro-policy-radio">
                        {newJoinRule === 'open' && <div className="pro-policy-radio-dot" />}
                      </div>
                      <div className="pro-policy-info">
                        <strong>Instant Access (Open)</strong>
                        <span>Anyone can join this community immediately without waiting for approval.</span>
                      </div>
                    </label>

                    <label
                      className={`pro-policy-card ${newJoinRule === 'approval' ? 'active' : ''}`}
                      onClick={() => setNewJoinRule('approval')}
                    >
                      <input
                        type="radio"
                        name="joinRule"
                        value="approval"
                        checked={newJoinRule === 'approval'}
                        onChange={() => setNewJoinRule('approval')}
                        style={{ display: 'none' }}
                      />
                      <div className="pro-policy-radio">
                        {newJoinRule === 'approval' && <div className="pro-policy-radio-dot" />}
                      </div>
                      <div className="pro-policy-info">
                        <strong>Admin Approval Required</strong>
                        <span>Members send a join request. Admins review and approve each member.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Space Name Input */}
              <div className="pro-form-field">
                <div className="pro-field-header">
                  <label className="pro-input-label">
                    {newType === 'public' ? 'Page Name' : 'Community Name'} <span className="pro-required-star">*</span>
                  </label>
                  <span className="pro-char-badge">{newCommunityName.length}/60</span>
                </div>
                <input
                  type="text"
                  className="pro-text-input"
                  placeholder={newType === 'public' ? 'e.g., Dhaka Photography Society' : 'e.g., AI Research & Engineering'}
                  value={newCommunityName}
                  maxLength={60}
                  onChange={e => {
                    setNewCommunityName(e.target.value)
                    if (!newCommunitySlug) {
                      setNewCommunitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                  }}
                  required
                />
              </div>

              {/* Integrated URL Slug Input Group */}
              <div className="pro-form-field">
                <div className="pro-field-header">
                  <label className="pro-input-label">
                    Unique URL Identifier <span className="pro-required-star">*</span>
                  </label>
                  <span className="pro-char-badge">{newCommunitySlug.length}/32</span>
                </div>
                <div className="pro-url-group">
                  <div className={`pro-url-addon ${newType === 'public' ? 'public' : 'private'}`}>
                    <span className="pro-url-host">gather.app/</span>
                    <strong className="pro-url-slug-tag">{newType === 'public' ? 'p/' : 'c/'}</strong>
                  </div>
                  <input
                    type="text"
                    className="pro-url-text-input"
                    placeholder="e.g. photography"
                    value={newCommunitySlug}
                    maxLength={32}
                    onChange={e => setNewCommunitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                  />
                </div>
                <span className="pro-field-helper">
                  Letters, numbers, and underscores only. This will be your permanent web address.
                </span>
              </div>

              {/* Category Select */}
              <div className="pro-form-field">
                <label className="pro-input-label">Category</label>
                <div className="pro-custom-select-wrap">
                  <select
                    className="pro-select-control"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                  >
                    <option value="General">General Community</option>
                    <option value="Technology">Technology & Software</option>
                    <option value="Education">Education & Learning</option>
                    <option value="Entertainment">Entertainment & Media</option>
                    <option value="Gaming">Gaming & Esports</option>
                    <option value="News">News & Discussion</option>
                    <option value="Lifestyle">Lifestyle & Travel</option>
                    <option value="Science">Science & Innovation</option>
                  </select>
                  <div className="pro-select-caret">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pro-form-field">
                <div className="pro-field-header">
                  <label className="pro-input-label">Description (Optional)</label>
                  <span className="pro-char-badge">{newCommunityDesc.length}/280</span>
                </div>
                <textarea
                  className="pro-textarea-control"
                  rows={2}
                  maxLength={280}
                  placeholder={newType === 'public' ? 'What can members share and discover on this page?' : 'What curated updates and topics will admins post here?'}
                  value={newCommunityDesc}
                  onChange={e => setNewCommunityDesc(e.target.value)}
                />
              </div>

              {/* Live Preview Card */}
              <div className="pro-live-preview-box">
                <div className="pro-preview-badge">LIVE PREVIEW</div>
                <div className="pro-preview-card">
                  <div className={`pro-preview-avatar ${newType === 'public' ? 'public' : 'private'}`}>
                    {(newCommunityName.trim() || (newType === 'public' ? 'P' : 'C'))[0].toUpperCase()}
                  </div>
                  <div className="pro-preview-meta">
                    <div className="pro-preview-title-row">
                      <strong className="pro-preview-name">
                        {newCommunityName.trim() || (newType === 'public' ? 'Untitled Page' : 'Untitled Community')}
                      </strong>
                      <span className={`pro-preview-type-pill ${newType === 'public' ? 'public' : 'private'}`}>
                        {newType === 'public' ? '🌐 Public Page' : '🔒 Private Community'}
                      </span>
                    </div>
                    <div className="pro-preview-subtitle">
                      <span>gather.app/{newType === 'public' ? 'p/' : 'c/'}{newCommunitySlug.trim() || 'slug'}</span>
                      <span className="pro-preview-dot">•</span>
                      <span>{newCategory}</span>
                      {newType === 'private' && (
                        <>
                          <span className="pro-preview-dot">•</span>
                          <span>{newJoinRule === 'approval' ? 'Requires Approval' : 'Instant Join'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pro-modal-footer">
                <button
                  type="button"
                  className="pro-btn-cancel"
                  onClick={() => setShowCreateCommunity(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pro-btn-submit"
                  disabled={creatingCommunity || !newCommunityName.trim() || !newCommunitySlug.trim()}
                >
                  {creatingCommunity ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                      Creating Space…
                    </span>
                  ) : (
                    <span>
                      {newType === 'public' ? 'Create Public Page' : 'Create Private Community'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: Admin Manage Join Requests
          ==================================================== */}
      {showRequestsModal && (
        <div className="modal-overlay" onClick={() => setShowRequestsModal(false)}>
          <div className="modal-box" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Join Requests</h3>
              <button
                type="button"
                onClick={() => setShowRequestsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {loadingRequests ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                Loading pending requests...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 500 }}>No pending join requests.</p>
                <small style={{ color: '#94a3b8' }}>When users request to join this private community, they will appear here.</small>
              </div>
            ) : (
              <div className="pending-requests-list">
                {pendingRequests.map(req => (
                  <div key={req.user_id} className="pending-request-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="post-author-avatar-stub" style={{ width: 34, height: 34, fontSize: 13 }}>
                        {(req.username || req.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>{req.name || req.username}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          @{req.username} • Requested {new Date(req.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-approve-req"
                        onClick={() => handleApproveRequest(currentCommunity?.slug || selectedCommunitySlug || '', req.user_id)}
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        className="btn-reject-req"
                        onClick={() => handleRejectRequest(currentCommunity?.slug || selectedCommunitySlug || '', req.user_id)}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          LIGHTBOX MODAL
          ==================================================== */}
      {fullImageUrl && (
        <div className="lightbox-overlay" onClick={() => setFullImageUrl(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={fullImageUrl} alt="Full view" />
            <button type="button" className="lightbox-close-btn" onClick={() => setFullImageUrl(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

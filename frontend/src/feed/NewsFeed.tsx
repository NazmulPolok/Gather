import { useState, useEffect, useRef, type FormEvent } from 'react'
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
  const [sortBy, setSortBy] = useState<'new' | 'top'>('new')

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
      sort: sortBy,
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
  }, [token, feedType, selectedCommunitySlug, sortBy])

  // Set default target community when selectedCommunitySlug changes
  useEffect(() => {
    if (selectedCommunitySlug) {
      setTargetCommunitySlug(selectedCommunitySlug)
    }
  }, [selectedCommunitySlug])

  // Community / Page Join, Leave, or Cancel Request
  async function handleToggleJoinCommunity(slug: string, currentlyJoined: boolean, isPending: boolean = false) {
    try {
      if (currentlyJoined || isPending) {
        await api.leaveCommunity(token, slug)
        setCommunities(curr =>
          curr.map(c =>
            c.slug === slug
              ? {
                  ...c,
                  is_member: false,
                  is_pending: false,
                  member_count: currentlyJoined ? Math.max(0, c.member_count - 1) : c.member_count,
                }
              : c
          )
        )
        setNotice(currentlyJoined ? `Left r/${slug}` : `Cancelled request for r/${slug}`)
      } else {
        const res = await api.joinCommunity(token, slug)
        if (res.status === 'pending') {
          setCommunities(curr =>
            curr.map(c =>
              c.slug === slug
                ? {
                    ...c,
                    is_pending: true,
                  }
                : c
            )
          )
          setNotice(`Join request submitted to admin for r/${slug}!`)
        } else {
          setCommunities(curr =>
            curr.map(c =>
              c.slug === slug
                ? {
                    ...c,
                    is_member: true,
                    is_pending: false,
                    member_count: c.member_count + 1,
                  }
                : c
            )
          )
          setNotice(`Joined r/${slug}!`)
        }
      }
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    }
  }

  // Admin Request Handlers
  async function handleOpenRequestsModal(slug: string) {
    setShowRequestsModal(true)
    setLoadingRequests(true)
    try {
      const list = await api.getJoinRequests(token, slug)
      setPendingRequests(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load join requests')
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
      setCreateCommunityError('Name and slug are required.')
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
        newType === 'private' ? newJoinRule : 'open',
        newCategory
      )
      setCommunities(curr => [...curr, created])
      setShowCreateCommunity(false)
      setNewCommunityName('')
      setNewCommunitySlug('')
      setNewCommunityDesc('')
      setNewType('public')
      setNewJoinRule('open')
      setSelectedCommunitySlug(created.slug)
      setNotice(
        newType === 'public'
          ? `Public Page "${created.name}" (r/${created.slug}) created! All members can post.`
          : `Private Community "${created.name}" (r/${created.slug}) created! Only admin can post.`
      )
      setTimeout(() => setNotice(''), 5000)
    } catch (err) {
      setCreateCommunityError(err instanceof Error ? err.message : 'Could not create')
    } finally {
      setCreatingCommunity(false)
    }
  }

  // Handle Media Selection (Image / Video)
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    if (isVideo && file.size > 250 * 1024 * 1024) {
      setError('Video cannot exceed 250MB')
      return
    }
    if (!isVideo && file.size > 15 * 1024 * 1024) {
      setError('Image cannot exceed 15MB')
      return
    }
    if (attachedPreview) URL.revokeObjectURL(attachedPreview)
    setAttachedImage(file)
    setAttachedPreview(URL.createObjectURL(file))
    setError('')
  }

  function clearImage() {
    if (attachedPreview) URL.revokeObjectURL(attachedPreview)
    setAttachedImage(null)
    setAttachedPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handle Create Post
  async function handleCreatePost(e: FormEvent) {
    e.preventDefault()
    const title = postTitle.trim()
    if (!title) {
      setError('Please provide a post title.')
      return
    }
    const slug = targetCommunitySlug || selectedCommunitySlug || communities[0]?.slug
    if (!slug) {
      setError('Please choose a community to post in.')
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
      setNotice('Post published to r/' + slug + '!')
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
          const nextUpvoted = !p.has_upvoted
          const nextCount = nextUpvoted ? p.upvote_count + 1 : Math.max(0, p.upvote_count - 1)
          return { ...p, has_upvoted: nextUpvoted, upvote_count: nextCount }
        }
        return p
      })
    )
    try {
      const res = await api.togglePostReact(token, postId)
      setPosts(curr =>
        curr.map(p =>
          p.id === postId ? { ...p, has_upvoted: res.has_upvoted, upvote_count: res.upvote_count } : p
        )
      )
    } catch {
      // Revert if error
      setPosts(curr =>
        curr.map(p => {
          if (p.id === postId) {
            const revertUpvoted = !p.has_upvoted
            const revertCount = revertUpvoted ? p.upvote_count + 1 : Math.max(0, p.upvote_count - 1)
            return { ...p, has_upvoted: revertUpvoted, upvote_count: revertCount }
          }
          return p
        })
      )
    }
  }

  // Handle Delete Post
  async function handleDeletePost(postId: number) {
    if (!window.confirm('Delete this post permanently?')) return
    try {
      await api.deletePost(token, postId)
      setPosts(curr => curr.filter(p => p.id !== postId))
      setNotice('Post deleted.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete post')
    }
  }

  // Handle Edit Post
  function startEditPost(post: PostItem) {
    setEditingPostId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content || '')
  }

  async function handleSaveEdit(postId: number) {
    if (!editTitle.trim()) return
    try {
      const updated = await api.editPost(token, postId, {
        title: editTitle.trim(),
        content: editContent.trim() || undefined,
      })
      setPosts(curr => curr.map(p => (p.id === postId ? updated : p)))
      setEditingPostId(null)
      setNotice('Post updated!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update post')
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
    if (!window.confirm('Delete comment?')) return
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

  const currentCommunity = selectedCommunitySlug
    ? communities.find(c => c.slug === selectedCommunitySlug)
    : null

  return (
    <div className="feed-layout-container">
      {/* ====================================================
          LEFT SIDEBAR: Reddit Feeds & Communities
          ==================================================== */}
      <aside className="feed-left-sidebar">
        <span className="feed-sidebar-title">FEEDS</span>
        <div className="feed-filter-menu">
          <button
            type="button"
            className={`feed-filter-btn ${!selectedCommunitySlug && feedType === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCommunitySlug(null)
              setFeedType('all')
            }}
          >
            <span className="feed-filter-icon">🔥</span>
            <div className="feed-filter-copy">
              <strong>Popular</strong>
              <small>All open communities</small>
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
            <span className="feed-filter-icon">🏠</span>
            <div className="feed-filter-copy">
              <strong>Home</strong>
              <small>Joined communities</small>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px 4px' }}>
          <span className="feed-filter-sublabel" style={{ padding: 0 }}>PAGES & COMMUNITIES</span>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              color: '#2563eb',
              cursor: 'pointer',
            }}
            onClick={() => setShowCreateCommunity(true)}
            title="Create a Public Page or Private Community"
          >
            + Create
          </button>
        </div>

        <div className="feed-filter-menu" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {communities.map(comm => {
            const isPrivate = comm.privacy_type === 'private'
            return (
              <button
                key={comm.id}
                type="button"
                className={`feed-filter-btn ${selectedCommunitySlug === comm.slug ? 'active' : ''}`}
                onClick={() => setSelectedCommunitySlug(comm.slug)}
              >
                <span className="feed-filter-icon" style={{ fontSize: '13px' }}>
                  {isPrivate ? '🔒' : '🌐'}
                </span>
                <div className="feed-filter-copy">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>r/{comm.slug}</strong>
                    <span className={`comm-type-pill ${isPrivate ? 'private' : 'public'}`}>
                      {isPrivate ? 'Community' : 'Page'}
                    </span>
                  </div>
                  <small>{comm.member_count} {comm.member_count === 1 ? 'member' : 'members'}</small>
                </div>
              </button>
            )
          })}
          {communities.length === 0 && (
            <span style={{ fontSize: '11px', color: '#888', padding: '8px' }}>No spaces yet. Click + Create above.</span>
          )}
        </div>
      </aside>

      {/* ====================================================
          CENTER MAIN FEED & POST COMPOSER
          ==================================================== */}
      <main className="feed-main-stream">
        {notice && (
          <div className="feed-banner-notice">
            <span>✓</span> {notice}
          </div>
        )}
        {error && (
          <div className="feed-banner-error">
            <span>⚠</span> {error}
            <button type="button" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Selected Community / Page Header Banner */}
        {currentCommunity && (
          <div className="reddit-community-banner">
            <div className="reddit-banner-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h2>r/{currentCommunity.slug}</h2>
                <span className={`reddit-type-tag ${currentCommunity.privacy_type === 'private' ? 'private' : 'public'}`}>
                  {currentCommunity.privacy_type === 'private' ? '🔒 Private Community' : '🌐 Public Page'}
                </span>
                {currentCommunity.privacy_type === 'private' && (
                  <span className="reddit-rule-tag">
                    {currentCommunity.join_rule === 'approval' ? 'Admin Approval Required' : 'Open for All'}
                  </span>
                )}
              </div>
              <p>{currentCommunity.description || currentCommunity.name}</p>
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#bfdbfe', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span>👥 {currentCommunity.member_count} {currentCommunity.member_count === 1 ? 'member' : 'members'}</span>
                <span>•</span>
                <span>{currentCommunity.privacy_type === 'private' ? 'Admin-Only Posting (Text, Media & Video)' : 'Open Posting for All Members'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {currentCommunity.is_member ? (
                <button
                  type="button"
                  className="reddit-join-btn joined"
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, true)}
                >
                  Joined
                </button>
              ) : currentCommunity.is_pending ? (
                <button
                  type="button"
                  className="reddit-join-btn pending"
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, false, true)}
                  title="Click to cancel join request"
                >
                  ⏳ Pending (Cancel)
                </button>
              ) : (
                <button
                  type="button"
                  className="reddit-join-btn"
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, false)}
                >
                  {currentCommunity.privacy_type === 'private' && currentCommunity.join_rule === 'approval'
                    ? '+ Request to Join'
                    : currentCommunity.privacy_type === 'private'
                    ? '+ Join Community'
                    : '+ Join Page'}
                </button>
              )}

              {/* Admin Join Requests Button for Private Community with Approval */}
              {currentCommunity.is_admin && currentCommunity.privacy_type === 'private' && currentCommunity.join_rule === 'approval' && (
                <button
                  type="button"
                  className="reddit-admin-requests-btn"
                  onClick={() => handleOpenRequestsModal(currentCommunity.slug)}
                >
                  Requests {currentCommunity.pending_requests_count ? `(${currentCommunity.pending_requests_count})` : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reddit Sort Bar */}
        <div className="reddit-sort-bar">
          <button
            type="button"
            className={`reddit-sort-btn ${sortBy === 'new' ? 'active' : ''}`}
            onClick={() => setSortBy('new')}
          >
            🕒 New
          </button>
          <button
            type="button"
            className={`reddit-sort-btn ${sortBy === 'top' ? 'active' : ''}`}
            onClick={() => setSortBy('top')}
          >
            🔥 Top Upvoted
          </button>
        </div>

        {/* Post Composer with Permissions based on Page vs Community */}
        {(() => {
          const targetComm = communities.find(c => c.slug === (targetCommunitySlug || selectedCommunitySlug || communities[0]?.slug))
          const isTargetPrivate = targetComm?.privacy_type === 'private'
          const canPost = targetComm ? (targetComm.can_post ?? (isTargetPrivate ? targetComm.is_admin : true)) : true

          return (
            <section className="premium-composer-card">
              <div className="composer-user-row">
                <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} />
                <div className="composer-user-details">
                  <strong>Create a Post</strong>
                  <div className="composer-group-badge">
                    <span>Post in:</span>
                    <select
                      className="composer-group-dropdown"
                      value={targetCommunitySlug || targetComm?.slug || ''}
                      onChange={e => setTargetCommunitySlug(e.target.value)}
                    >
                      {communities.map(comm => (
                        <option key={comm.id} value={comm.slug}>
                          {comm.privacy_type === 'private' ? '🔒 Community: ' : '🌐 Page: '}
                          {comm.name} (r/{comm.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Locked Notice for Regular Members in Private Community */}
              {isTargetPrivate && !canPost ? (
                <div className="composer-locked-box">
                  <span className="locked-icon" style={{ fontSize: '24px' }}>🔒</span>
                  <div className="locked-text">
                    <strong>Only Admins can post in the "{targetComm?.name}" Private Community</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                      Community Admins can publish posts (text, photos, and videos). As a member, you can read, upvote, and comment on all posts.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Status Helper Badge */}
                  {isTargetPrivate ? (
                    <div className="composer-perm-badge admin">
                      <span>★ Community Admin</span>
                      <small>You can publish posts with text, images, and videos in this Private Community.</small>
                    </div>
                  ) : (
                    <div className="composer-perm-badge public">
                      <span>🌐 Public Page</span>
                      <small>Open for all members to share text, photos, and videos!</small>
                    </div>
                  )}

                  <form className="composer-inner-form" onSubmit={handleCreatePost}>
                    <input
                      type="text"
                      placeholder="Title (required)"
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      className="composer-textarea"
                      style={{ minHeight: 'auto', padding: '10px 14px', fontWeight: 600, fontSize: '14.5px' }}
                      maxLength={300}
                      required
                    />
                    <textarea
                      placeholder="Text (optional markdown or details)..."
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      className="composer-textarea"
                      rows={3}
                    />

                    {attachedPreview && (
                      <div className="composer-attachment-card">
                        {attachedImage?.type.startsWith('video/') ? (
                          <video
                            src={attachedPreview}
                            controls
                            playsInline
                            className="composer-attachment-img"
                            style={{ maxHeight: '320px', width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
                          />
                        ) : (
                          <img src={attachedPreview} alt="Preview" className="composer-attachment-img" />
                        )}
                        <button type="button" className="attachment-close-pill" onClick={clearImage}>
                          ✕ Remove
                        </button>
                      </div>
                    )}

                    <div className="composer-bottom-bar">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                      />
                      <button
                        type="button"
                        className="composer-photo-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📷 Photo / Media
                      </button>

                      <button
                        type="submit"
                        className="composer-publish-btn"
                        disabled={submittingPost || !postTitle.trim()}
                      >
                        {submittingPost ? 'Posting…' : 'Post'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          )
        })()}

        {/* Posts Stack */}
        {loading ? (
          <div className="feed-spinner-container">
            <span className="spinner" /> Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty-container">
            <div style={{ fontSize: '38px', marginBottom: '10px' }}>📰</div>
            <h3>No posts yet in this feed</h3>
            <p>Be the first one to create a post or join communities to populate your home feed!</p>
          </div>
        ) : (
          <div className="feed-cards-stack">
            {posts.map(post => (
              <article key={post.id} className="reddit-card">
                {/* Left Upvote Pillar */}
                <div className="reddit-vote-col">
                  <button
                    type="button"
                    className={`reddit-up-btn ${post.has_upvoted ? 'upvoted' : ''}`}
                    onClick={() => handleToggleUpvote(post.id)}
                    title="Upvote"
                  >
                    ▲
                  </button>
                  <span className={`reddit-vote-col-score ${post.has_upvoted ? 'upvoted' : ''}`}>
                    {post.upvote_count}
                  </span>
                </div>

                {/* Right Post Body */}
                <div className="reddit-body-col">
                  {/* Metadata header */}
                  <div className="reddit-post-meta">
                    <span
                      className="reddit-sub-pill"
                      onClick={() => setSelectedCommunitySlug(post.community.slug)}
                    >
                      r/{post.community.slug}
                    </span>
                    <span>•</span>
                    <span
                      className="reddit-author-handle"
                      style={onOpenProfile ? { cursor: 'pointer', textDecoration: 'underline' } : undefined}
                      onClick={() => onOpenProfile?.(post.author.username)}
                      title={`View ${post.author.username}'s profile`}
                    >
                      Posted by u/{post.author.username}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(post.created_at)}</span>
                    {post.updated_at && <span className="post-edited-badge">(edited)</span>}

                    {/* Author or Admin Delete / Edit actions */}
                    {(post.author.user_id === user.id) && (
                      <div className="post-header-actions" style={{ marginLeft: 'auto' }}>
                        <button
                          type="button"
                          className="post-card-edit-btn"
                          onClick={() => startEditPost(post)}
                        >
                          ✏ Edit
                        </button>
                        <button
                          type="button"
                          className="post-card-delete-btn"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Editor */}
                  {editingPostId === post.id ? (
                    <div className="post-inline-editor">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="post-inline-edit-textarea"
                        style={{ minHeight: 'auto', fontWeight: 700 }}
                      />
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="post-inline-edit-textarea"
                      />
                      <div className="post-inline-edit-actions">
                        <button
                          type="button"
                          className="post-edit-cancel-btn"
                          onClick={() => setEditingPostId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="post-edit-save-btn"
                          onClick={() => handleSaveEdit(post.id)}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Title */}
                      <h3 className="reddit-title">{post.title}</h3>

                      {/* Content */}
                      {post.content && (
                        <p className="post-body-text">{post.content}</p>
                      )}

                      {/* Media Image */}
                      {post.image_url && (
                        <div
                          className="post-media-frame"
                          onClick={() => setFullImageUrl(getMediaUrl(post.image_url))}
                        >
                          <img src={getMediaUrl(post.image_url)} alt="Post upload" loading="lazy" />
                          <span className="media-zoom-hint">🔍 Click to enlarge</span>
                        </div>
                      )}

                      {/* Media Video */}
                      {post.video_url && (
                        <div className="post-media-frame post-video-frame" style={{ cursor: 'default' }}>
                          <video
                            src={getMediaUrl(post.video_url)}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', maxHeight: '480px', borderRadius: '8px', display: 'block', backgroundColor: '#000' }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions Toolbar */}
                  <div className="post-actions-toolbar">
                    <button
                      type="button"
                      className={`reddit-vote-pill ${post.has_upvoted ? 'active-upvoted' : ''}`}
                      onClick={() => handleToggleUpvote(post.id)}
                    >
                      <span className="vote-arrow-glyph">▲</span>
                      <span>{post.upvote_count} {post.upvote_count === 1 ? 'Upvote' : 'Upvotes'}</span>
                    </button>

                    <button
                      type="button"
                      className={`reddit-comment-pill ${expandedComments[post.id] ? 'active' : ''}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <span>💬</span>
                      <span>{post.comment_count} Comments</span>
                    </button>

                    <button
                      type="button"
                      className="reddit-share-pill"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href)
                        setNotice('Post link copied!')
                        setTimeout(() => setNotice(''), 3000)
                      }}
                    >
                      🔗 Share
                    </button>
                  </div>

                  {/* Comments Drawer */}
                  {expandedComments[post.id] && (
                    <div className="post-comments-drawer">
                      <div className="comments-thread-list">
                        {post.comments.map(c => (
                          <div key={c.id} className="comment-thread-item">
                            <UserAvatar
                              avatarUrl={c.author.avatar_url}
                              fallback={c.author.username}
                              size={28}
                            />
                            <div className="comment-speech-bubble">
                              <div className="comment-header-row">
                                <span
                                  className="comment-author-title"
                                  style={onOpenProfile ? { cursor: 'pointer', textDecoration: 'underline' } : undefined}
                                  onClick={() => onOpenProfile?.(c.author.username)}
                                  title={`View ${c.author.username}'s profile`}
                                >
                                  u/{c.author.username}
                                </span>
                                <span className="comment-timestamp">
                                  {formatRelativeTime(c.created_at)}
                                </span>
                                {(c.author.user_id === user.id || post.author.user_id === user.id) && (
                                  <button
                                    type="button"
                                    className="comment-inline-delete"
                                    onClick={() => handleDeleteComment(post.id, c.id)}
                                    title="Delete comment"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <p className="comment-text-body">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        {post.comments.length === 0 && (
                          <div className="comments-blank-note">
                            No comments yet. Start the conversation!
                          </div>
                        )}
                      </div>

                      {/* Add comment input */}
                      <div className="comment-composer-bar">
                        <UserAvatar avatarUrl={user.avatar_url} fallback={user.username} size={26} />
                        <input
                          type="text"
                          placeholder="Write a comment…"
                          className="comment-text-input"
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
                          className="comment-submit-action"
                          disabled={submittingComment[post.id] || !(commentInputs[post.id] || '').trim()}
                          onClick={() => handleAddComment(post.id)}
                        >
                          {submittingComment[post.id] ? '…' : 'Comment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ====================================================
          RIGHT SIDEBAR: Reddit Community Info
          ==================================================== */}
      <aside className="feed-right-sidebar">
        {currentCommunity ? (
          <div className="community-info-card">
            <div className="community-info-header">
              <div className="community-info-title">
                <h4>
                  {currentCommunity.privacy_type === 'public' ? 'About Page' : 'About Community'}{' '}
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>
                    ({currentCommunity.privacy_type === 'public' ? 'p/' : 'c/'}{currentCommunity.slug})
                  </span>
                </h4>
                {currentCommunity.privacy_type === 'public' ? (
                  <span className="community-policy-badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                    🌐 Public Page
                  </span>
                ) : (
                  <span className="community-policy-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                    🔒 Private Community
                  </span>
                )}
              </div>
            </div>
            <p className="community-about-copy">
              {currentCommunity.description || (currentCommunity.privacy_type === 'public' 
                ? 'Welcome to this public page! All members can create posts, share images, videos, and discussions.' 
                : 'Welcome to this private community! Only admins can post content. Members can view, like, and comment.')}
            </p>

            <div style={{ marginBottom: '12px', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', fontSize: '11.5px', color: '#475569', border: '1px solid #e2e8f0' }}>
              {currentCommunity.privacy_type === 'public' ? (
                <div>
                  <strong>👥 Posting Rule:</strong> Everyone who joins this Page can freely post text, images, and videos.
                </div>
              ) : (
                <div>
                  <strong>🔒 Posting Rule:</strong> <em>Admin only</em>. Regular members can view, upvote/like, and comment.
                  <div style={{ marginTop: '4px' }}>
                    <strong>Access:</strong> {currentCommunity.join_rule === 'approval' ? 'Admin approval required to join' : 'Open for anyone to join'}
                  </div>
                </div>
              )}
            </div>

            <div className="community-stats-row">
              <div className="stat-item">
                <strong>{currentCommunity.member_count}</strong>
                <small>Members</small>
              </div>
              <div className="stat-item">
                <strong>{currentCommunity.category || 'General'}</strong>
                <small>Category</small>
              </div>
            </div>

            {/* Admin Pending Requests Button */}
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
              className={`switch-to-chat-btn ${currentCommunity.is_pending ? 'pending' : ''}`}
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
                className="switch-to-chat-btn"
                style={{ background: '#f5f7f5', color: '#333', borderColor: '#ccc' }}
                onClick={onOpenGroupChat}
              >
                💬 Open Messenger Chat
              </button>
            )}
          </div>
        ) : (
          <div className="community-info-card">
            <div className="community-info-header">
              <div className="community-info-title">
                <h4>Pages & Communities</h4>
                <span className="community-policy-badge">Hub</span>
              </div>
            </div>
            <p className="community-about-copy">
              Explore Public Pages where everyone shares and posts, or Private Communities where admins post curated updates and media!
            </p>
            <div className="community-stats-row">
              <div className="stat-item">
                <strong>{communities.length}</strong>
                <small>Spaces</small>
              </div>
              <div className="stat-item">
                <strong>{posts.length}</strong>
                <small>Posts loaded</small>
              </div>
            </div>
            <button
              type="button"
              className="switch-to-chat-btn"
              onClick={() => setShowCreateCommunity(true)}
            >
              + Create Page or Community
            </button>
            {onOpenGroupChat && (
              <button
                type="button"
                className="switch-to-chat-btn"
                style={{ background: '#f5f7f5', color: '#333', borderColor: '#ccc' }}
                onClick={onOpenGroupChat}
              >
                💬 Switch to Messenger Chat
              </button>
            )}
          </div>
        )}

        {/* Community Rules card */}
        <div className="community-info-card">
          <h4 style={{ margin: 0, fontSize: '13px', color: '#444' }}>Guidelines & Rules</h4>
          <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#666', lineHeight: 1.6 }}>
            <li><strong>Public Page:</strong> Open for all. Any member can post text, images, and videos.</li>
            <li><strong>Private Community:</strong> Admin-only posting (text, images, videos). Members can comment and react.</li>
            <li>Admin can choose Open join or Admin Approval for Private Community.</li>
            <li>Be respectful and constructive across all spaces.</li>
          </ol>
        </div>
      </aside>

      {/* ====================================================
          MODAL: Create Page or Community (Professional Redesign)
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

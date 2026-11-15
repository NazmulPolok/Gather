import { useState, useEffect, useRef, type FormEvent } from 'react'
import {
  api,
  getMediaUrl,
  type AuthUser,
  type CommunitySummary,
  type PostItem,
  type CommentItem,
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

  // Create Community Modal
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunitySlug, setNewCommunitySlug] = useState('')
  const [newCommunityDesc, setNewCommunityDesc] = useState('')
  const [creatingCommunity, setCreatingCommunity] = useState(false)
  const [createCommunityError, setCreateCommunityError] = useState('')

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

  // Community Join/Leave
  async function handleToggleJoinCommunity(slug: string, currentlyJoined: boolean) {
    try {
      if (currentlyJoined) {
        await api.leaveCommunity(token, slug)
      } else {
        await api.joinCommunity(token, slug)
      }
      setCommunities(curr =>
        curr.map(c =>
          c.slug === slug
            ? {
                ...c,
                is_member: !currentlyJoined,
                member_count: currentlyJoined ? Math.max(0, c.member_count - 1) : c.member_count + 1,
              }
            : c
        )
      )
      setNotice(currentlyJoined ? `Left r/${slug}` : `Joined r/${slug}!`)
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    }
  }

  // Handle Create Community
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
        newCommunityDesc.trim() || undefined
      )
      setCommunities(curr => [...curr, created])
      setShowCreateCommunity(false)
      setNewCommunityName('')
      setNewCommunitySlug('')
      setNewCommunityDesc('')
      setSelectedCommunitySlug(created.slug)
      setNotice(`Community r/${created.slug} created successfully!`)
      setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      setCreateCommunityError(err instanceof Error ? err.message : 'Could not create community')
    } finally {
      setCreatingCommunity(false)
    }
  }

  // Handle Image Selection
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Image cannot exceed 10MB')
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
      if (attachedImage) {
        const uploadRes = await api.uploadPostImage(token, attachedImage)
        imageUrl = uploadRes.image_url
      }
      const newPost = await api.createPost(token, {
        community_slug: slug,
        title,
        content: postContent.trim() || undefined,
        image_url: imageUrl,
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
          <span className="feed-filter-sublabel" style={{ padding: 0 }}>COMMUNITIES</span>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              color: '#2b7545',
              cursor: 'pointer',
            }}
            onClick={() => setShowCreateCommunity(true)}
          >
            + Create
          </button>
        </div>

        <div className="feed-filter-menu" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {communities.map(comm => (
            <button
              key={comm.id}
              type="button"
              className={`feed-filter-btn ${selectedCommunitySlug === comm.slug ? 'active' : ''}`}
              onClick={() => setSelectedCommunitySlug(comm.slug)}
            >
              <span className="feed-filter-icon" style={{ fontSize: '13px', fontWeight: 700, color: '#276939' }}>
                r/
              </span>
              <div className="feed-filter-copy">
                <strong>r/{comm.slug}</strong>
                <small>{comm.member_count} {comm.member_count === 1 ? 'member' : 'members'}</small>
              </div>
            </button>
          ))}
          {communities.length === 0 && (
            <span style={{ fontSize: '11px', color: '#888', padding: '8px' }}>No communities yet.</span>
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

        {/* Selected Community Header Banner */}
        {currentCommunity && (
          <div className="reddit-community-banner">
            <div className="reddit-banner-text">
              <h2>r/{currentCommunity.slug}</h2>
              <p>{currentCommunity.description || currentCommunity.name}</p>
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#c0dec7' }}>
                👥 {currentCommunity.member_count} {currentCommunity.member_count === 1 ? 'member' : 'members'}
              </div>
            </div>
            <button
              type="button"
              className={`reddit-join-btn ${currentCommunity.is_member ? 'joined' : ''}`}
              onClick={() => handleToggleJoinCommunity(currentCommunity.slug, currentCommunity.is_member)}
            >
              {currentCommunity.is_member ? 'Joined' : 'Join'}
            </button>
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

        {/* Reddit-Style Post Composer */}
        <section className="premium-composer-card">
          <div className="composer-user-row">
            <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} />
            <div className="composer-user-details">
              <strong>Create a Post</strong>
              <div className="composer-group-badge">
                <span>Post in:</span>
                <select
                  className="composer-group-dropdown"
                  value={targetCommunitySlug}
                  onChange={e => setTargetCommunitySlug(e.target.value)}
                >
                  {communities.map(comm => (
                    <option key={comm.id} value={comm.slug}>
                      r/{comm.slug} ({comm.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
                <img src={attachedPreview} alt="Preview" className="composer-attachment-img" />
                <button type="button" className="attachment-close-pill" onClick={clearImage}>
                  ✕ Remove
                </button>
              </div>
            )}

            <div className="composer-bottom-bar">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
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
        </section>

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
                <h4>About r/{currentCommunity.slug}</h4>
                <span className="community-policy-badge">Open Community</span>
              </div>
            </div>
            <p className="community-about-copy">
              {currentCommunity.description || 'Welcome to this community. Share ideas, ask questions, and engage with other members!'}
            </p>
            <div className="community-stats-row">
              <div className="stat-item">
                <strong>{currentCommunity.member_count}</strong>
                <small>Members</small>
              </div>
              <div className="stat-item">
                <strong>{currentCommunity.slug}</strong>
                <small>Subreddit</small>
              </div>
            </div>
            <button
              type="button"
              className={`switch-to-chat-btn`}
              onClick={() => handleToggleJoinCommunity(currentCommunity.slug, currentCommunity.is_member)}
            >
              {currentCommunity.is_member ? 'Leave Community' : '+ Join Community'}
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
                <h4>Gather Communities</h4>
                <span className="community-policy-badge">Reddit Style</span>
              </div>
            </div>
            <p className="community-about-copy">
              Your home for discovering stories, ideas, technology, and questions shared across Gather communities.
            </p>
            <div className="community-stats-row">
              <div className="stat-item">
                <strong>{communities.length}</strong>
                <small>Communities</small>
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
              + Create a Community
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
          <h4 style={{ margin: 0, fontSize: '13px', color: '#444' }}>Reddit Guidelines</h4>
          <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#666', lineHeight: 1.6 }}>
            <li>Remember the human.</li>
            <li>Be respectful and constructive.</li>
            <li>Post meaningful titles and clear media.</li>
            <li>Vote based on quality and relevance.</li>
          </ol>
        </div>
      </aside>

      {/* ====================================================
          MODAL: Create Community
          ==================================================== */}
      {showCreateCommunity && (
        <div className="modal-overlay" onClick={() => setShowCreateCommunity(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Create a Community</h3>
            {createCommunityError && (
              <div className="comment-error-alert">{createCommunityError}</div>
            )}
            <form onSubmit={handleCreateCommunitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="modal-input-field">
                <label>Community Name</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence"
                  value={newCommunityName}
                  onChange={e => {
                    setNewCommunityName(e.target.value)
                    if (!newCommunitySlug) {
                      setNewCommunitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                  }}
                  required
                />
              </div>

              <div className="modal-input-field">
                <label>Subreddit Slug (r/slug)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#276939' }}>r/</span>
                  <input
                    type="text"
                    placeholder="e.g. ai"
                    value={newCommunitySlug}
                    onChange={e => setNewCommunitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="modal-input-field">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="What is this community about?"
                  rows={3}
                  value={newCommunityDesc}
                  onChange={e => setNewCommunityDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="post-edit-cancel-btn"
                  onClick={() => setShowCreateCommunity(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="post-edit-save-btn"
                  disabled={creatingCommunity || !newCommunityName.trim() || !newCommunitySlug.trim()}
                >
                  {creatingCommunity ? 'Creating…' : 'Create Community'}
                </button>
              </div>
            </form>
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

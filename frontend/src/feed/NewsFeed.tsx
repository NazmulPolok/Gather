import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { api, getMediaUrl, type AuthUser, type Group, type PostItem, type CommentItem } from '../api/client'
import { UserAvatar } from '../components/UserAvatar'
import { GroupAvatar } from '../components/GroupAvatar'

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = Date.now()
    const diffSec = Math.floor((now - date.getTime()) / 1000)
    if (diffSec < 45) return 'Just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}

export function NewsFeed({
  token,
  user,
  groups: initialGroups,
  selectedGroupId,
  onSelectGroup,
  onOpenGroupChat,
}: {
  token: string
  user: AuthUser
  groups?: Group[]
  selectedGroupId?: number | null
  onSelectGroup?: (groupId: number | null) => void
  onOpenGroupChat?: (group: Group) => void
}) {
  const [groups, setGroups] = useState<Group[]>(initialGroups || [])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeGroupFilter, setActiveGroupFilter] = useState<number | null>(selectedGroupId ?? null)

  // Create post state
  const [postText, setPostText] = useState('')
  const [targetGroupId, setTargetGroupId] = useState<number>(selectedGroupId || (groups[0]?.id ?? 0))
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Expanded comments state: Record<postId, boolean>
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})

  // Full image preview modal
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!initialGroups || initialGroups.length === 0) {
      api.groups(token).then(setGroups).catch(() => setGroups([]))
    }
  }, [token, initialGroups])

  useEffect(() => {
    if (selectedGroupId !== undefined) {
      setActiveGroupFilter(selectedGroupId)
      if (selectedGroupId) {
        setTargetGroupId(selectedGroupId)
      }
    }
  }, [selectedGroupId])

  useEffect(() => {
    if (!targetGroupId && groups.length > 0) {
      setTargetGroupId(groups[0].id)
    }
  }, [groups, targetGroupId])

  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    api.getNewsFeed(token, activeGroupFilter || undefined)
      .then(res => {
        if (live) setPosts(res)
      })
      .catch(err => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load news feed')
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => { live = false }
  }, [token, activeGroupFilter])

  function handleFilterChange(groupId: number | null) {
    setActiveGroupFilter(groupId)
    if (groupId) setTargetGroupId(groupId)
    onSelectGroup?.(groupId)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo cannot exceed 10MB')
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

  async function handleCreatePost(e: FormEvent) {
    e.preventDefault()
    if (!targetGroupId) {
      setError('Please select a group to post in.')
      return
    }
    const content = postText.trim()
    if (!content && !attachedImage) {
      setError('Please add some text or a photo.')
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
      const newPost = await api.createPost(token, targetGroupId, content || undefined, imageUrl)
      setPosts(current => [newPost, ...current])
      setPostText('')
      clearImage()
      setNotice('Post shared successfully!')
      setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create post')
    } finally {
      setSubmittingPost(false)
    }
  }

  async function handleToggleUpvote(postId: number) {
    // Optimistic toggle
    setPosts(current =>
      current.map(p => {
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
      setPosts(current =>
        current.map(p => (p.id === postId ? { ...p, has_upvoted: res.has_upvoted, upvote_count: res.upvote_count } : p))
      )
    } catch {
      // Revert if error
      setPosts(current =>
        current.map(p => {
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

  async function handleDeletePost(postId: number) {
    if (!window.confirm('Delete this post permanently?')) return
    try {
      await api.deletePost(token, postId)
      setPosts(current => current.filter(p => p.id !== postId))
      setNotice('Post deleted.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete post')
    }
  }

  function toggleComments(postId: number) {
    setExpandedComments(current => ({ ...current, [postId]: !current[postId] }))
  }

  function handleCommentAdded(postId: number, newComment: CommentItem) {
    setPosts(current =>
      current.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comment_count: p.comment_count + 1,
            comments: [...p.comments, newComment],
          }
        }
        return p
      })
    )
  }

  function handleCommentDeleted(postId: number, commentId: number) {
    setPosts(current =>
      current.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comment_count: Math.max(0, p.comment_count - 1),
            comments: p.comments.filter(c => c.id !== commentId),
          }
        }
        return p
      })
    )
  }

  const activeGroupObj = groups.find(g => g.id === (activeGroupFilter || targetGroupId))

  return (
    <main className="feed-layout-container">
      {/* Left Sidebar: Communities & Feeds */}
      <aside className="feed-left-sidebar">
        <div className="feed-sidebar-title">FEEDS & COMMUNITIES</div>
        <div className="feed-filter-menu">
          <button
            type="button"
            className={`feed-filter-btn ${activeGroupFilter === null ? 'active' : ''}`}
            onClick={() => handleFilterChange(null)}
          >
            <span className="feed-filter-icon">🌐</span>
            <div className="feed-filter-copy">
              <strong>All Joined Feeds</strong>
              <small>Combined updates</small>
            </div>
          </button>

          <div className="feed-filter-sublabel">MY GROUPS ({groups.length})</div>

          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              className={`feed-filter-btn ${activeGroupFilter === g.id ? 'active' : ''}`}
              onClick={() => handleFilterChange(g.id)}
            >
              <GroupAvatar avatarUrl={g.avatar_url} name={g.name} size={30} />
              <div className="feed-filter-copy">
                <strong>{g.name}</strong>
                <small>{g.join_policy === 'approval' ? '🔒 Approval required' : '🌐 Open'}</small>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Stream Column */}
      <div className="feed-main-stream">
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

        {/* Facebook-style Create Post Card */}
        <section className="premium-composer-card">
          <div className="composer-user-row">
            <UserAvatar
              avatarUrl={user.avatar_url}
              fallback={user.nickname || user.first_name || user.username}
              size={42}
            />
            <div className="composer-user-details">
              <strong>{user.first_name} {user.last_name || ''}</strong>
              <div className="composer-group-badge">
                <span>Posting in</span>
                <select
                  value={targetGroupId}
                  onChange={e => setTargetGroupId(Number(e.target.value))}
                  disabled={submittingPost}
                  className="composer-group-dropdown"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="composer-inner-form">
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder={`What's on your mind, ${user.first_name}?`}
              rows={3}
              maxLength={10000}
              disabled={submittingPost}
              className="composer-textarea"
            />

            {attachedPreview && (
              <div className="composer-attachment-card">
                <img src={attachedPreview} alt="Upload preview" className="composer-attachment-img" />
                <button
                  type="button"
                  className="attachment-close-pill"
                  onClick={clearImage}
                  title="Remove photo"
                >
                  ✕ Remove
                </button>
              </div>
            )}

            <div className="composer-bottom-bar">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <button
                type="button"
                className="composer-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={submittingPost}
              >
                <span className="photo-icon-svg">📸</span> Photo / Image
              </button>

              <button
                type="submit"
                className="composer-submit-btn"
                disabled={submittingPost || (!postText.trim() && !attachedImage)}
              >
                {submittingPost ? 'Posting…' : 'Share Post'}
              </button>
            </div>
          </form>
        </section>

        {/* Post Stream */}
        {loading ? (
          <div className="feed-spinner-container">
            <span className="spinner" /> Loading news feed…
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty-container">
            <div className="empty-bubble-icon">📰</div>
            <h3>No posts yet in this feed</h3>
            <p>
              {activeGroupFilter
                ? 'Be the first member to share an update, thought, or photo in this group!'
                : 'Share an update or photo in any of your groups to see it here.'}
            </p>
          </div>
        ) : (
          <div className="feed-cards-stack">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                token={token}
                onToggleUpvote={() => handleToggleUpvote(post.id)}
                onDeletePost={() => handleDeletePost(post.id)}
                isCommentsOpen={Boolean(expandedComments[post.id])}
                onToggleComments={() => toggleComments(post.id)}
                onCommentAdded={newComment => handleCommentAdded(post.id, newComment)}
                onCommentDeleted={commentId => handleCommentDeleted(post.id, commentId)}
                onViewFullImage={url => setFullImageUrl(url)}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar: Community / Group Info */}
      <aside className="feed-right-sidebar">
        {activeGroupObj ? (
          <div className="community-info-card">
            <div className="community-info-header">
              <GroupAvatar avatarUrl={activeGroupObj.avatar_url} name={activeGroupObj.name} size={48} />
              <div className="community-info-title">
                <h4>{activeGroupObj.name}</h4>
                <span className="community-policy-badge">
                  {activeGroupObj.join_policy === 'approval' ? '🔒 Private · Approval required' : '🌐 Open community'}
                </span>
              </div>
            </div>
            <div className="community-code-box">
              <label>INVITE CODE</label>
              <div className="code-copy-row">
                <code>{activeGroupObj.invite_code}</code>
                <button
                  type="button"
                  className="code-copy-btn"
                  onClick={() => {
                    void navigator.clipboard?.writeText(activeGroupObj.invite_code)
                    setNotice('Invite code copied!')
                    setTimeout(() => setNotice(''), 3000)
                  }}
                  title="Copy invite code"
                >
                  Copy
                </button>
              </div>
            </div>
            {onOpenGroupChat && (
              <button
                type="button"
                className="switch-to-chat-btn"
                onClick={() => onOpenGroupChat(activeGroupObj)}
              >
                💬 Open Group Chat
              </button>
            )}
          </div>
        ) : (
          <div className="community-info-card">
            <h4>Gather Feed</h4>
            <p className="community-about-copy">
              Welcome to your Gather News Feed! Here you can discover posts, thoughts, and photos shared across all your groups.
            </p>
            <div className="community-stats-row">
              <div className="stat-item">
                <strong>{groups.length}</strong>
                <small>Joined Groups</small>
              </div>
              <div className="stat-item">
                <strong>{posts.length}</strong>
                <small>Feed Posts</small>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Lightbox Fullscreen Image Modal */}
      {fullImageUrl && (
        <div className="lightbox-overlay" onClick={() => setFullImageUrl(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button type="button" className="lightbox-close-btn" onClick={() => setFullImageUrl(null)}>
              ✕
            </button>
            <img src={fullImageUrl} alt="Full resolution view" />
          </div>
        </div>
      )}
    </main>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return <span className="premium-role-badge role-admin" title="Group Admin">🛡️ Admin</span>
  }
  if (role === 'moderator') {
    return <span className="premium-role-badge role-mod" title="Group Moderator">⚔️ Mod</span>
  }
  if (role === 'contributor') {
    return <span className="premium-role-badge role-contrib" title="Contributor">⭐ Contributor</span>
  }
  return null
}

function PostCard({
  post,
  currentUserId,
  token,
  onToggleUpvote,
  onDeletePost,
  isCommentsOpen,
  onToggleComments,
  onCommentAdded,
  onCommentDeleted,
  onViewFullImage,
  currentUser,
}: {
  post: PostItem
  currentUserId: number
  token: string
  onToggleUpvote: () => void
  onDeletePost: () => void
  isCommentsOpen: boolean
  onToggleComments: () => void
  onCommentAdded: (comment: CommentItem) => void
  onCommentDeleted: (commentId: number) => void
  onViewFullImage: (url: string) => void
  currentUser: AuthUser
}) {
  const [newCommentText, setNewCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')

  const isAuthor = post.author.user_id === currentUserId
  const canDelete = isAuthor || post.author.role === 'admin' || post.author.role === 'moderator'

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()
    const content = newCommentText.trim()
    if (!content) return
    setSubmittingComment(true)
    setCommentError('')
    try {
      const comment = await api.createComment(token, post.id, content)
      onCommentAdded(comment)
      setNewCommentText('')
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Could not add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  function handleCommentKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.deleteComment(token, commentId)
      onCommentDeleted(commentId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete comment')
    }
  }

  return (
    <article className="premium-post-card">
      {/* Post Header */}
      <header className="post-header-top">
        <UserAvatar avatarUrl={post.author.avatar_url} fallback={post.author.name} size={40} />
        <div className="post-header-text">
          <div className="post-title-line">
            <strong className="post-author-name">{post.author.name}</strong>
            <RoleBadge role={post.author.role} />
            <span className="post-in-group">
              in <strong>{post.group.name}</strong>
            </span>
          </div>
          <div className="post-subtitle-line">
            <span className="post-author-username">@{post.author.username}</span>
            <span className="dot-divider">·</span>
            <time className="post-relative-time" title={new Date(post.created_at).toLocaleString()}>
              {formatRelativeTime(post.created_at)}
            </time>
          </div>
        </div>

        {canDelete && (
          <button
            type="button"
            className="post-card-delete-btn"
            onClick={onDeletePost}
            title="Delete post"
            aria-label="Delete post"
          >
            🗑
          </button>
        )}
      </header>

      {/* Post Text Content */}
      {post.content && <p className="post-body-text">{post.content}</p>}

      {/* Post Image Container */}
      {post.image_url && (
        <div className="post-media-frame" onClick={() => onViewFullImage(getMediaUrl(post.image_url!))}>
          <img src={getMediaUrl(post.image_url)} alt="Attached visual" loading="lazy" />
          <span className="media-zoom-hint">🔍 Click to zoom</span>
        </div>
      )}

      {/* Reddit & Facebook style Action Pills Footer */}
      <footer className="post-actions-toolbar">
        {/* Reddit-style Upvote Pill */}
        <button
          type="button"
          className={`reddit-vote-pill ${post.has_upvoted ? 'active-upvoted' : ''}`}
          onClick={onToggleUpvote}
          title={post.has_upvoted ? 'Remove upvote' : 'Upvote post'}
        >
          <span className="vote-arrow-glyph">▲</span>
          <span className="vote-number-count">{post.upvote_count}</span>
        </button>

        {/* Comment toggle pill */}
        <button
          type="button"
          className={`reddit-comment-pill ${isCommentsOpen ? 'active' : ''}`}
          onClick={onToggleComments}
        >
          <span className="comment-icon-glyph">💬</span>
          <span>{post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}</span>
        </button>

        {/* Share pill */}
        <button
          type="button"
          className="reddit-share-pill"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href)
            alert('Post link copied to clipboard!')
          }}
          title="Share post"
        >
          <span>⧉</span> Share
        </button>
      </footer>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="post-comments-drawer">
          {commentError && <div className="comment-error-alert">{commentError}</div>}

          {post.comments.length > 0 ? (
            <div className="comments-thread-list">
              {post.comments.map(c => {
                const isCommentAuthor = c.author.user_id === currentUserId
                return (
                  <div key={c.id} className="comment-thread-item">
                    <UserAvatar avatarUrl={c.author.avatar_url} fallback={c.author.name} size={32} />
                    <div className="comment-speech-bubble">
                      <div className="comment-header-row">
                        <strong className="comment-author-title">{c.author.name}</strong>
                        <RoleBadge role={c.author.role} />
                        <span className="comment-timestamp">{formatRelativeTime(c.created_at)}</span>
                        {isCommentAuthor && (
                          <button
                            type="button"
                            className="comment-inline-delete"
                            onClick={() => handleDeleteComment(c.id)}
                            title="Delete comment"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="comment-text-body">{c.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="comments-blank-note">No comments yet. Be the first to start the conversation!</div>
          )}

          {/* Add Comment Input Bar */}
          <form onSubmit={handleAddComment} className="comment-composer-bar">
            <UserAvatar avatarUrl={currentUser.avatar_url} fallback={currentUser.first_name} size={30} />
            <input
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Write a comment…"
              maxLength={5000}
              disabled={submittingComment}
              className="comment-text-input"
            />
            <button
              type="submit"
              className="comment-submit-action"
              disabled={submittingComment || !newCommentText.trim()}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  )
}

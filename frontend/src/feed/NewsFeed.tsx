import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { api, getMediaUrl, type AuthUser, type Group, type PostItem, type CommentItem } from '../api/client'
import { UserAvatar } from '../components/UserAvatar'
import { GroupAvatar } from '../components/GroupAvatar'

export function NewsFeed({
  token,
  user,
  groups: initialGroups,
  selectedGroupId,
  onSelectGroup,
}: {
  token: string
  user: AuthUser
  groups?: Group[]
  selectedGroupId?: number | null
  onSelectGroup?: (groupId: number | null) => void
}) {
  const [groups, setGroups] = useState<Group[]>(initialGroups || [])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeGroupFilter, setActiveGroupFilter] = useState<number | null>(selectedGroupId ?? null)

  useEffect(() => {
    if (!initialGroups || initialGroups.length === 0) {
      api.groups(token).then(setGroups).catch(() => setGroups([]))
    }
  }, [token, initialGroups])

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
      setNotice('Post shared to group feed!')
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

  return (
    <main className="feed-layout">
      {/* Feed Sidebar / Group filter */}
      <aside className="feed-sidebar">
        <div className="feed-sidebar-header">
          <h3>FEEDS & GROUPS</h3>
        </div>
        <div className="feed-nav-list">
          <button
            className={`feed-nav-item ${activeGroupFilter === null ? 'active' : ''}`}
            onClick={() => handleFilterChange(null)}
          >
            <span className="feed-nav-icon">🌐</span>
            <div className="feed-nav-copy">
              <strong>All Joined Groups</strong>
              <small>Combined news feed</small>
            </div>
          </button>

          <div className="feed-nav-divider">YOUR GROUPS</div>

          {groups.map(g => (
            <button
              key={g.id}
              className={`feed-nav-item ${activeGroupFilter === g.id ? 'active' : ''}`}
              onClick={() => handleFilterChange(g.id)}
            >
              <span className="avatar avatar-small">
                <GroupAvatar avatarUrl={g.avatar_url} name={g.name} />
              </span>
              <div className="feed-nav-copy">
                <strong>{g.name}</strong>
                <small>{g.join_policy === 'approval' ? '🔒 Private' : '🌐 Public'}</small>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Stream Area */}
      <section className="feed-stream-area">
        {notice && (
          <div className="toast toast-success feed-toast">
            <span>✓</span> {notice}
          </div>
        )}
        {error && (
          <div className="toast toast-error feed-toast">
            <span>⚠</span> {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Create Post Box (Facebook-style) */}
        <div className="feed-composer-card">
          <div className="feed-composer-header">
            <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.first_name || user.username} />
            <div className="feed-composer-meta">
              <strong>{user.first_name} {user.last_name || ''}</strong>
              <div className="composer-group-select">
                <span>Posting in:</span>
                <select
                  value={targetGroupId}
                  onChange={e => setTargetGroupId(Number(e.target.value))}
                  disabled={submittingPost}
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

          <form onSubmit={handleCreatePost} className="feed-composer-form">
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder={`What's on your mind, ${user.first_name}?`}
              rows={3}
              maxLength={10000}
              disabled={submittingPost}
            />

            {attachedPreview && (
              <div className="feed-attached-preview">
                <img src={attachedPreview} alt="Post attachment preview" />
                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={clearImage}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="feed-composer-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              <button
                type="button"
                className="attach-photo-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submittingPost}
              >
                <span>📷</span> Photo
              </button>

              <button
                type="submit"
                className="button button-primary feed-submit-btn"
                disabled={submittingPost || (!postText.trim() && !attachedImage)}
              >
                {submittingPost ? 'Posting…' : 'Share Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Post Stream */}
        {loading ? (
          <div className="feed-loading">
            <span className="spinner" /> Loading news feed…
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty-state">
            <div className="empty-icon">📰</div>
            <h3>No posts yet</h3>
            <p>
              {activeGroupFilter
                ? 'Be the first to share a post or photo in this group!'
                : 'Share an update or photo in any of your groups to see it here.'}
            </p>
          </div>
        ) : (
          <div className="feed-posts-list">
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
              />
            ))}
          </div>
        )}
      </section>

      {/* Full Image Modal */}
      {fullImageUrl && (
        <div className="modal-backdrop" onClick={() => setFullImageUrl(null)}>
          <div className="full-image-dialog" onClick={e => e.stopPropagation()}>
            <button className="full-image-close" onClick={() => setFullImageUrl(null)}>
              ✕
            </button>
            <img src={fullImageUrl} alt="Full view" />
          </div>
        </div>
      )}
    </main>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return <span className="feed-role-badge badge-admin" title="Group Admin">🛡️ Admin</span>
  }
  if (role === 'moderator') {
    return <span className="feed-role-badge badge-mod" title="Group Moderator">⚔️ Moderator</span>
  }
  if (role === 'contributor') {
    return <span className="feed-role-badge badge-contrib" title="Group Contributor">⭐ Contributor</span>
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
}) {
  const [newCommentText, setNewCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')

  const isAuthor = post.author.user_id === currentUserId
  const canDelete = isAuthor || post.author.role === 'admin' || post.author.role === 'moderator'

  const formattedDate = new Date(post.created_at).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

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
    <article className="feed-post-card">
      {/* Header */}
      <div className="post-card-header">
        <UserAvatar avatarUrl={post.author.avatar_url} fallback={post.author.name} />
        <div className="post-header-info">
          <div className="post-author-row">
            <strong>{post.author.name}</strong>
            <RoleBadge role={post.author.role} />
            <span className="post-group-tag">
              in <strong>{post.group.name}</strong>
            </span>
          </div>
          <small className="post-timestamp">@{post.author.username} · {formattedDate}</small>
        </div>

        {canDelete && (
          <button
            type="button"
            className="post-delete-btn"
            onClick={onDeletePost}
            title="Delete post"
            aria-label="Delete post"
          >
            🗑
          </button>
        )}
      </div>

      {/* Body Content */}
      {post.content && <p className="post-text-content">{post.content}</p>}

      {/* Attached Image */}
      {post.image_url && (
        <div className="post-image-container" onClick={() => onViewFullImage(getMediaUrl(post.image_url!))}>
          <img src={getMediaUrl(post.image_url)} alt="Post visual content" loading="lazy" />
        </div>
      )}

      {/* Reddit-style Upvote & Comments Footer */}
      <div className="post-card-footer">
        {/* Reddit-style Upvote Button */}
        <button
          type="button"
          className={`reddit-upvote-btn ${post.has_upvoted ? 'upvoted' : ''}`}
          onClick={onToggleUpvote}
          title={post.has_upvoted ? 'Remove upvote' : 'Upvote post'}
        >
          <span className="upvote-arrow">▲</span>
          <span className="upvote-count">{post.upvote_count}</span>
        </button>

        {/* Comment toggle button */}
        <button
          type="button"
          className={`post-comment-btn ${isCommentsOpen ? 'active' : ''}`}
          onClick={onToggleComments}
        >
          <span>💬</span>
          <span>{post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="post-comments-section">
          {commentError && <div className="comment-error">{commentError}</div>}

          {post.comments.length > 0 ? (
            <div className="comments-stream">
              {post.comments.map(c => {
                const isCommentAuthor = c.author.user_id === currentUserId
                return (
                  <div key={c.id} className="comment-row">
                    <UserAvatar avatarUrl={c.author.avatar_url} fallback={c.author.name} />
                    <div className="comment-bubble">
                      <div className="comment-meta">
                        <strong>{c.author.name}</strong>
                        <RoleBadge role={c.author.role} />
                        <small>{new Date(c.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
                        {isCommentAuthor && (
                          <button
                            type="button"
                            className="comment-delete-btn"
                            onClick={() => handleDeleteComment(c.id)}
                            title="Delete comment"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="comment-text">{c.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="comments-empty">No comments yet. Start the discussion!</div>
          )}

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Write a comment…"
              maxLength={5000}
              disabled={submittingComment}
            />
            <button
              type="submit"
              className="comment-submit-btn"
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

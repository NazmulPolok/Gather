import { useState, useEffect, useRef, type FormEvent } from 'react'
import {
  api,
  getMediaUrl,
  type AuthUser,
  type UserProfile,
  type PostItem,
  type CommunitySummary,
  PRESET_AVATARS,
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
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'recently'
  }
}

function formatJoinDate(dateStr?: string | null): string {
  if (!dateStr) return 'Joined Gather'
  try {
    const date = new Date(dateStr)
    return `Joined ${date.toLocaleDateString([], { month: 'long', year: 'numeric' })}`
  } catch {
    return 'Joined Gather'
  }
}

export function ProfileView({
  token,
  currentUser,
  targetUsername,
  onUserUpdated,
  onBackToFeed,
  onOpenChat,
}: {
  token: string
  currentUser: AuthUser
  targetUsername: string
  onUserUpdated?: (user: AuthUser) => void
  onBackToFeed?: () => void
  onOpenChat?: () => void
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostItem[]>([])
  const [communities, setCommunities] = useState<CommunitySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isOwnProfile = currentUser.username.toLowerCase() === targetUsername.toLowerCase()

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editNickname, setEditNickname] = useState(currentUser.nickname || '')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Quick Post state on own profile
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [selectedCommunitySlug, setSelectedCommunitySlug] = useState<string>('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = useState(false)
  const postFileInputRef = useRef<HTMLInputElement>(null)

  // Comments & Lightbox state
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({})
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null)

  // Inline post editing
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editPostTitle, setEditPostTitle] = useState('')
  const [editPostContent, setEditPostContent] = useState('')

  // 1. Fetch Profile and User's Posts
  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')

    Promise.all([
      api.getUserProfile(token, targetUsername),
      api.getUserPosts(token, targetUsername),
      api.getCommunities(token).catch(() => []),
    ])
      .then(([prof, userPosts, comms]) => {
        if (!live) return
        setProfile(prof)
        setPosts(userPosts)
        setCommunities(comms)
        if (comms.length > 0 && !selectedCommunitySlug) {
          setSelectedCommunitySlug(comms[0].slug)
        }
      })
      .catch(err => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load profile')
      })
      .finally(() => {
        if (live) setLoading(false)
      })

    return () => {
      live = false
    }
  }, [token, targetUsername])

  // Upvote toggle
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

  // Delete post
  async function handleDeletePost(postId: number) {
    if (!window.confirm('Delete this post permanently?')) return
    try {
      await api.deletePost(token, postId)
      setPosts(curr => curr.filter(p => p.id !== postId))
      if (profile) {
        setProfile({ ...profile, post_count: Math.max(0, profile.post_count - 1) })
      }
      setNotice('Post deleted.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete post')
    }
  }

  // Edit post
  function startEditPost(post: PostItem) {
    setEditingPostId(post.id)
    setEditPostTitle(post.title)
    setEditPostContent(post.content || '')
  }

  async function handleSaveEdit(postId: number) {
    if (!editPostTitle.trim()) return
    try {
      const updated = await api.editPost(token, postId, {
        title: editPostTitle.trim(),
        content: editPostContent.trim() || undefined,
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

  // Create post on profile
  async function handleCreatePost(e: FormEvent) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) {
      setError('Please provide a post title.')
      return
    }
    const slug = selectedCommunitySlug || communities[0]?.slug
    if (!slug) {
      setError('Please choose a community.')
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
        content: newContent.trim() || undefined,
        image_url: imageUrl,
        video_url: videoUrl,
      })
      setPosts(curr => [newPost, ...curr])
      setNewTitle('')
      setNewContent('')
      if (attachedPreview) URL.revokeObjectURL(attachedPreview)
      setAttachedImage(null)
      setAttachedPreview(null)
      if (profile) {
        setProfile({ ...profile, post_count: profile.post_count + 1 })
      }
      setNotice('Post shared on your profile!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create post')
    } finally {
      setSubmittingPost(false)
    }
  }

  // Edit profile actions (Nickname & Avatar)
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setError('')
    try {
      const updated = await api.updateAvatar(token, file)
      onUserUpdated?.(updated)
      if (profile) {
        setProfile({ ...profile, avatar_url: updated.avatar_url })
      }
      setNotice('Profile photo updated!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSaveProfileModal(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      let updatedUser = currentUser
      if (selectedPreset) {
        updatedUser = await api.updateProfile(token, { avatar_url: selectedPreset })
      }
      if (editNickname.trim() !== (currentUser.nickname || '')) {
        updatedUser = await api.updateProfile(token, { nickname: editNickname.trim() || null })
      }
      onUserUpdated?.(updatedUser)
      if (profile) {
        setProfile({
          ...profile,
          nickname: updatedUser.nickname,
          avatar_url: updatedUser.avatar_url,
        })
      }
      setShowEditModal(false)
      setNotice('Profile updated successfully!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) {
    return (
      <div className="fb-profile-container">
        <div className="feed-spinner-container" style={{ padding: '60px 0' }}>
          <span className="spinner" /> Loading profile…
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fb-profile-container">
        <div className="feed-empty-container">
          <h3>User not found</h3>
          <p>The profile you are looking for does not exist.</p>
          {onBackToFeed && (
            <button type="button" className="button button-primary" onClick={onBackToFeed}>
              Back to News Feed
            </button>
          )}
        </div>
      </div>
    )
  }

  const displayName = profile.nickname || `${profile.first_name} ${profile.last_name}`

  return (
    <div className="fb-profile-container">
      {notice && (
        <div className="feed-banner-notice" style={{ maxWidth: '1000px', margin: '0 auto 14px' }}>
          <span>✓</span> {notice}
        </div>
      )}
      {error && (
        <div className="feed-banner-error" style={{ maxWidth: '1000px', margin: '0 auto 14px' }}>
          <span>⚠</span> {error}
          <button type="button" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* ====================================================
          FACEBOOK-STYLE COVER & PROFILE HEADER
          ==================================================== */}
      <section className="fb-cover-card">
        {/* Cover Photo Banner */}
        <div className="fb-cover-banner">
          <div className="fb-cover-overlay" />
          <div className="fb-cover-badge">
            <span>✨ Gather Member</span>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="fb-profile-bar">
          <div className="fb-avatar-wrap">
            <UserAvatar
              avatarUrl={profile.avatar_url}
              fallback={displayName}
              size={128}
            />
            {isOwnProfile && (
              <button
                type="button"
                className="fb-avatar-edit-btn"
                title="Change Profile Photo"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="fb-profile-titles">
            <h1 className="fb-profile-name">
              {displayName}
              {profile.nickname && (
                <span className="fb-real-name">({profile.first_name} {profile.last_name})</span>
              )}
            </h1>
            <div className="fb-profile-meta-row">
              <span className="fb-meta-handle">@{profile.username}</span>
              <span>•</span>
              <span className="fb-meta-date">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {formatJoinDate(profile.created_at)}
                </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fb-profile-actions">
            {isOwnProfile ? (
              <button
                type="button"
                className="fb-edit-profile-btn"
                onClick={() => {
                  setEditNickname(profile.nickname || '')
                  setShowEditModal(true)
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              onOpenChat && (
                <button
                  type="button"
                  className="fb-message-btn"
                  onClick={onOpenChat}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Message</span>
                </button>
              )
            )}
            {onBackToFeed && (
              <button
                type="button"
                className="fb-secondary-btn"
                onClick={onBackToFeed}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>News Feed</span>
              </button>
            )}
          </div>
        </div>

        {/* Facebook-style Stats Tabs Bar */}
        <div className="fb-tabs-row">
          <div className="fb-tab-item active">
            <span>Posts</span>
            <span className="fb-tab-badge">{profile.post_count}</span>
          </div>
          <div className="fb-tab-item">
            <span>Upvotes Received</span>
            <span className="fb-tab-badge">{profile.total_upvotes}</span>
          </div>
          <div className="fb-tab-item">
            <span>Communities</span>
            <span className="fb-tab-badge">{profile.community_count}</span>
          </div>
        </div>
      </section>

      {/* ====================================================
          2-COLUMN PROFILE CONTENT: LEFT INTRO + RIGHT POSTS
          ==================================================== */}
      <div className="fb-profile-body-grid">
        {/* Left Column: Intro Card */}
        <aside className="fb-left-intro">
          <div className="fb-card fb-intro-card">
            <h3 className="fb-card-title">Intro</h3>
            <p className="fb-intro-text">
              Welcome to {profile.first_name}'s profile on Gather. Check out all posts, updates, and community activity below.
            </p>
            <div className="fb-intro-list">
              <div className="fb-intro-item">
                <div className="fb-intro-icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span><strong>Username:</strong> @{profile.username}</span>
              </div>
              <div className="fb-intro-item">
                <div className="fb-intro-icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <span><strong>Total Posts:</strong> {profile.post_count} published</span>
              </div>
              <div className="fb-intro-item">
                <div className="fb-intro-icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <span><strong>Reputation:</strong> {profile.total_upvotes} upvotes</span>
              </div>
              <div className="fb-intro-item">
                <div className="fb-intro-icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <span><strong>Member Since:</strong> {formatJoinDate(profile.created_at)}</span>
              </div>
            </div>
            {isOwnProfile && (
              <button
                type="button"
                className="fb-intro-action-btn"
                onClick={() => setShowEditModal(true)}
              >
                Edit Details
              </button>
            )}
          </div>
        </aside>

        {/* Right Column: Timeline / Posts */}
        <main className="fb-right-timeline">
          {/* Create Post on Profile (if own profile) */}
          {isOwnProfile && (
            <div className="fb-card fb-composer-box">
              <div className="composer-user-row">
                <UserAvatar avatarUrl={profile.avatar_url} fallback={displayName} size={42} />
                <div className="composer-user-details">
                  <strong className="composer-title-heading">Create a Post</strong>
                  <div className="composer-group-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>Post in:</span>
                    <select
                      className="composer-group-dropdown"
                      value={selectedCommunitySlug}
                      onChange={e => setSelectedCommunitySlug(e.target.value)}
                    >
                      {communities.map(comm => (
                        <option key={comm.id} value={comm.slug}>
                          {comm.privacy_type === 'private' ? '🔒 Community: c/' : '🌐 Page: p/'}{comm.slug} ({comm.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <form className="composer-inner-form" onSubmit={handleCreatePost}>
                <input
                  type="text"
                  placeholder="Post Title (required)..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="composer-title-input"
                  maxLength={300}
                  required
                />
                <textarea
                  placeholder={`What's on your mind, ${profile.first_name}? Share details, thoughts, or ideas...`}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="composer-body-textarea"
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
                      />
                    ) : (
                      <img src={attachedPreview} alt="Preview" className="composer-attachment-img" />
                    )}
                    <button
                      type="button"
                      className="attachment-close-pill"
                      onClick={() => {
                        if (attachedPreview) URL.revokeObjectURL(attachedPreview)
                        setAttachedImage(null)
                        setAttachedPreview(null)
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}

                <div className="composer-bottom-bar">
                  <input
                    ref={postFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const isVideo = file.type.startsWith('video/')
                      if (isVideo && file.size > 250 * 1024 * 1024) {
                        setError('Video cannot exceed 250MB')
                        return
                      }
                      if (!isVideo && file.size > 15 * 1024 * 1024) {
                        setError('Photo cannot exceed 15MB')
                        return
                      }
                      if (attachedPreview) URL.revokeObjectURL(attachedPreview)
                      setAttachedImage(file)
                      setAttachedPreview(URL.createObjectURL(file))
                    }}
                  />
                  <button
                    type="button"
                    className="composer-photo-btn"
                    onClick={() => postFileInputRef.current?.click()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Photo / Media</span>
                  </button>

                  <button
                    type="submit"
                    className="composer-publish-btn"
                    disabled={submittingPost || !newTitle.trim()}
                  >
                    {submittingPost ? 'Publishing…' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timeline Feed Header */}
          <div className="fb-timeline-title-row">
            <h3>{isOwnProfile ? 'Your Posts' : `${displayName}'s Posts`}</h3>
            <span className="fb-timeline-count">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
          </div>

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="fb-card fb-empty-timeline">
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📝</div>
              <h4>No posts yet</h4>
              <p>
                {isOwnProfile
                  ? "You haven't posted anything yet. Share your first post above!"
                  : `${displayName} hasn't posted anything yet.`}
              </p>
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
                    <div className="reddit-post-meta">
                      {post.video_url ? (
                        <span className="profile-video-page-badge" title={`Published on Watch Page @${post.community.slug}`}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 8-6 4 6 4V8Z" />
                            <rect width="14" height="12" x="2" y="6" rx="2" />
                          </svg>
                          <span>Watch Video • @{post.community.slug}</span>
                        </span>
                      ) : (
                        <span className="reddit-sub-pill">{post.community.privacy_type === "private" ? "c/" : "p/"}{post.community.slug}</span>
                      )}
                      <span>•</span>
                      <span className="reddit-author-handle">@{post.author.username}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(post.created_at)}</span>
                      {post.updated_at && <span className="post-edited-badge">(edited)</span>}

                      {/* Author Edit/Delete */}
                      {(post.author.user_id === currentUser.id) && (
                        <div className="post-header-actions" style={{ marginLeft: 'auto' }}>
                          <button
                            type="button"
                            className="post-card-edit-btn"
                            onClick={() => startEditPost(post)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="post-card-delete-btn"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline Editor */}
                    {editingPostId === post.id ? (
                      <div className="post-inline-editor">
                        <input
                          type="text"
                          value={editPostTitle}
                          onChange={e => setEditPostTitle(e.target.value)}
                          className="post-inline-edit-textarea"
                          style={{ minHeight: 'auto', fontWeight: 700 }}
                        />
                        <textarea
                          value={editPostContent}
                          onChange={e => setEditPostContent(e.target.value)}
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
                        <h3 className="reddit-title">{post.title}</h3>
                        {post.content && <p className="post-body-text">{post.content}</p>}
                        {post.image_url && (
                          <div
                            className="post-media-frame"
                            onClick={() => setFullImageUrl(getMediaUrl(post.image_url))}
                          >
                            <img src={getMediaUrl(post.image_url)} alt="Post" loading="lazy" />
                            <span className="media-zoom-hint">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <span>Click to enlarge</span>
                              </span>
                          </div>
                        )}
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

                    {/* Post Toolbar */}
                    <div className="post-actions-toolbar">
                      <button
                        type="button"
                        className={`reddit-vote-pill ${post.has_upvoted ? 'active-upvoted' : ''}`}
                        onClick={() => handleToggleUpvote(post.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19V5M5 12l7-7 7 7"/>
                        </svg>
                        <span>{post.upvote_count} Upvotes</span>
                      </button>

                      <button
                        type="button"
                        className={`reddit-comment-pill ${expandedComments[post.id] ? 'active' : ''}`}
                        onClick={() => toggleComments(post.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        <span>Share</span>
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
                                  <span className="comment-author-title">@{c.author.username}</span>
                                  <span className="comment-timestamp">
                                    {formatRelativeTime(c.created_at)}
                                  </span>
                                  {(c.author.user_id === currentUser.id || post.author.user_id === currentUser.id) && (
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

                        {/* Add Comment input */}
                        <div className="comment-composer-bar">
                          <UserAvatar avatarUrl={currentUser.avatar_url} fallback={currentUser.username} size={26} />
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
      </div>

      {/* ====================================================
          MODAL: Edit Profile (Nickname & Preset Avatar)
          ==================================================== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Edit Profile</h3>
            <form onSubmit={handleSaveProfileModal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="modal-input-field">
                <label>Nickname / Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Johnny"
                  value={editNickname}
                  onChange={e => setEditNickname(e.target.value)}
                  maxLength={64}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b584d', display: 'block', marginBottom: '8px' }}>
                  Choose Avatar Emoji Character
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {PRESET_AVATARS.map(preset => {
                    const isSelected = selectedPreset === preset.id || (!selectedPreset && currentUser.avatar_url === preset.id)
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        style={{
                          border: isSelected ? '2px solid #2563eb' : '1px solid #dce4dc',
                          background: preset.bg,
                          borderRadius: '10px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{preset.emoji}</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 600, color: preset.color }}>{preset.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="post-edit-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="post-edit-save-btn"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving…' : 'Save Profile'}
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

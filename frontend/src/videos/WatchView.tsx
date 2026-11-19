import { useState, useEffect, useRef, useMemo, type FormEvent } from 'react'
import {
  api,
  getMediaUrl,
  type AuthUser,
  type CommunitySummary,
  type PostItem,
  type CommentItem,
} from '../api/client'
import { UserAvatar } from '../components/UserAvatar'

// =========================================================================
// CLEAN VECTOR SVG ICONS (YOUTUBE & MODERN SOCIAL PLATFORM STYLE)
// =========================================================================

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconPage({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

function IconVideoUpload({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" />
      <line x1="9" y1="10" x2="9" y2="14" />
      <line x1="7" y1="12" x2="11" y2="12" />
    </svg>
  )
}

function IconGlobe({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function IconLock({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconTV({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function IconThumbUp({ size = 15, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function IconComment({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconShare({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function IconUploadCloud({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconShieldCheck({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function IconFilm({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  )
}

function IconChatDots({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconFeedNewspaper({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  )
}

// Helpers
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

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`
  return `${views} ${views === 1 ? 'view' : 'views'}`
}

const CATEGORIES = [
  'All',
  'Tech & Gadgets',
  'Gaming',
  'Music & Entertainment',
  'Education',
  'Vlogs & Lifestyle',
  'News & Politics',
  'Comedy',
]

interface WatchViewProps {
  token: string
  user: AuthUser
  openPageTrigger?: boolean
  onOpenPageTriggerHandled?: () => void
  onOpenChat?: () => void
  onOpenFeed?: () => void
  onOpenProfile?: (username: string) => void
}

export function WatchView({
  token,
  user,
  openPageTrigger,
  onOpenPageTriggerHandled,
  onOpenProfile,
}: WatchViewProps) {
  const [pages, setPages] = useState<CommunitySummary[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all')

  // Watch Theater Modal
  const [activeWatchPost, setActiveWatchPost] = useState<PostItem | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentsList, setCommentsList] = useState<CommentItem[]>([])

  // Open a Page Modal state
  const [isOpenPageModal, setIsOpenPageModal] = useState(false)
  const [pageName, setPageName] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [pageCategory, setPageCategory] = useState('Tech & Gadgets')
  const [pagePrivacy, setPagePrivacy] = useState<'public' | 'private'>('public')
  const [pageDescription, setPageDescription] = useState('')
  const [submittingPage, setSubmittingPage] = useState(false)
  const [pageError, setPageError] = useState('')

  // Upload Video Modal state
  const [isUploadVideoModal, setIsUploadVideoModal] = useState(false)
  const [uploadTargetSlug, setUploadTargetSlug] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Share Modal state
  const [sharePost, setSharePost] = useState<PostItem | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Trigger Open Page from Settings
  useEffect(() => {
    if (openPageTrigger) {
      setIsOpenPageModal(true)
      onOpenPageTriggerHandled?.()
    }
  }, [openPageTrigger, onOpenPageTriggerHandled])

  // Load Pages & Feed Posts
  const fetchAllData = async () => {
    setLoading(true)
    setError('')
    try {
      const [loadedPages, loadedFeed] = await Promise.all([
        api.getCommunities(token),
        api.getNewsFeed(token, { limit: 100 }),
      ])
      setPages(loadedPages)
      setPosts(loadedFeed)
      if (loadedPages.length > 0 && !uploadTargetSlug) {
        const allowedPage = loadedPages.find(p => p.can_upload_video) || loadedPages[0]
        setUploadTargetSlug(allowedPage.slug)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video library')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [token])

  // User's own pages (where user is admin or creator)
  const myPages = useMemo(() => {
    return pages.filter(p => p.is_admin)
  }, [pages])

  const handleOpenUploadModal = (preferredSlug?: string) => {
    // REQUIREMENT: User MUST open a page first before uploading videos!
    // Videos cannot be uploaded directly from a personal account without a page.
    if (myPages.length === 0) {
      setPageError('To upload videos to Watch, you must create a Page first! Personal ID uploads are not allowed in Watch.')
      setIsOpenPageModal(true)
      return
    }
    setUploadError('')
    if (preferredSlug && myPages.some(p => p.slug === preferredSlug)) {
      setUploadTargetSlug(preferredSlug)
    } else if (!uploadTargetSlug || !myPages.some(p => p.slug === uploadTargetSlug)) {
      setUploadTargetSlug(myPages[0].slug)
    }
    setIsUploadVideoModal(true)
  }

  // All video posts
  const videoPosts = useMemo(() => {
    return posts.filter(p => Boolean(p.video_url))
  }, [posts])

  // Filtered video posts
  const filteredVideos = useMemo(() => {
    return videoPosts.filter(p => {
      // 1. Page filter
      if (selectedPageSlug && p.community.slug.toLowerCase() !== selectedPageSlug.toLowerCase()) {
        return false
      }
      // 2. Privacy filter
      const pagePrivacyType = p.community.privacy_type || 'public'
      if (privacyFilter !== 'all' && pagePrivacyType !== privacyFilter) {
        return false
      }
      // 3. Category filter
      if (selectedCategory !== 'All') {
        const commCat = p.community.category || 'General'
        if (selectedCategory === 'My Pages') {
          if (!p.community.is_admin && p.author.username !== user.username) return false
        } else if (commCat !== selectedCategory) {
          return false
        }
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const titleMatch = p.title.toLowerCase().includes(q)
        const descMatch = (p.content || '').toLowerCase().includes(q)
        const channelMatch = p.community.name.toLowerCase().includes(q)
        const authorMatch = p.author.name.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !channelMatch && !authorMatch) {
          return false
        }
      }
      return true
    })
  }, [videoPosts, selectedPageSlug, privacyFilter, selectedCategory, searchQuery, user.username])

  // Currently selected Page details
  const activePageDetails = useMemo(() => {
    if (!selectedPageSlug) return null
    return pages.find(p => p.slug.toLowerCase() === selectedPageSlug.toLowerCase()) || null
  }, [pages, selectedPageSlug])

  // Handle Video Watch selection
  const handleWatchVideo = (post: PostItem) => {
    setActiveWatchPost(post)
    setCommentsList(post.comments || [])
    api.incrementPostView(token, post.id)
      .then(res => {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views_count: res.views_count } : p))
        setActiveWatchPost(prev => prev && prev.id === post.id ? { ...prev, views_count: res.views_count } : prev)
      })
      .catch(() => {})
  }

  // Handle Like / React
  const handleToggleLike = async (postId: number) => {
    try {
      const res = await api.togglePostReact(token, postId)
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, has_upvoted: res.has_upvoted, upvote_count: res.upvote_count }
            : p
        )
      )
      if (activeWatchPost && activeWatchPost.id === postId) {
        setActiveWatchPost(prev =>
          prev ? { ...prev, has_upvoted: res.has_upvoted, upvote_count: res.upvote_count } : prev
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not react to video')
    }
  }

  // Handle Submit Comment on Watch Modal
  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!activeWatchPost || !newCommentText.trim()) return
    setSubmittingComment(true)
    try {
      const newComment = await api.createComment(token, activeWatchPost.id, newCommentText.trim())
      setCommentsList(prev => [...prev, newComment])
      setPosts(prev =>
        prev.map(p =>
          p.id === activeWatchPost.id
            ? {
                ...p,
                comment_count: p.comment_count + 1,
                comments: [...p.comments, newComment],
              }
            : p
        )
      )
      setNewCommentText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Handle Follow / Join Page
  const handleToggleFollowPage = async (slug: string, currentlyJoined: boolean) => {
    try {
      if (currentlyJoined) {
        await api.leaveCommunity(token, slug)
      } else {
        await api.joinCommunity(token, slug)
      }
      setPages(prev =>
        prev.map(p =>
          p.slug === slug
            ? {
                ...p,
                is_member: !currentlyJoined,
                member_count: currentlyJoined ? Math.max(0, p.member_count - 1) : p.member_count + 1,
              }
            : p
        )
      )
      setNotice(currentlyJoined ? `Unfollowed @${slug}` : `Followed @${slug}!`)
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    }
  }

  // Handle Create Page Submit
  const handleCreatePageSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!pageName.trim() || !pageSlug.trim()) {
      setPageError('Page name and handle are required.')
      return
    }
    setSubmittingPage(true)
    setPageError('')
    try {
      const created = await api.createCommunity(
        token,
        pageName.trim(),
        pageSlug.trim().toLowerCase(),
        pageDescription.trim() || undefined,
        pagePrivacy,
        pageCategory
      )
      setPages(prev => [created, ...prev])
      setIsOpenPageModal(false)
      setPageName('')
      setPageSlug('')
      setPageDescription('')
      setSelectedPageSlug(created.slug)
      setUploadTargetSlug(created.slug)
      setNotice(`Page "${created.name}" created! You can now upload videos to your page.`)
      setTimeout(() => setNotice(''), 4000)
      setIsUploadVideoModal(true)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not create page')
    } finally {
      setSubmittingPage(false)
    }
  }

  // Handle Video File Select
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV)')
      return
    }
    if (file.size > 250 * 1024 * 1024) {
      setUploadError('Video file exceeds 250MB limit.')
      return
    }
    setUploadError('')
    setSelectedVideoFile(file)
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }

  // Handle Upload Video Submit
  const handleUploadVideoSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedVideoFile) {
      setUploadError('Please choose a video file to upload.')
      return
    }
    if (!videoTitle.trim()) {
      setUploadError('Please provide a video title.')
      return
    }
    if (!uploadTargetSlug) {
      setUploadError('Please select a page to upload to.')
      return
    }

    const targetPage = pages.find(p => p.slug === uploadTargetSlug)
    if (targetPage && targetPage.privacy_type === 'private' && !targetPage.can_upload_video) {
      setUploadError('This is a private page. Only the page admin can upload videos.')
      return
    }

    setUploadingVideo(true)
    setUploadError('')
    try {
      const uploadRes = await api.uploadPostMedia(token, selectedVideoFile)
      if (!uploadRes.video_url) {
        throw new Error('Video upload failed on the server.')
      }

      const createdPost = await api.createPost(token, {
        community_slug: uploadTargetSlug,
        title: videoTitle.trim(),
        content: videoDescription.trim() || undefined,
        video_url: uploadRes.video_url,
      })

      setPosts(prev => [createdPost, ...prev])
      setIsUploadVideoModal(false)
      setSelectedVideoFile(null)
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(null)
      setVideoTitle('')
      setVideoDescription('')
      setNotice('Video uploaded and published successfully!')
      setTimeout(() => setNotice(''), 4000)

      handleWatchVideo(createdPost)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload video')
    } finally {
      setUploadingVideo(false)
    }
  }

  // Copy share link
  const handleCopyShareLink = (post: PostItem) => {
    const shareUrl = `${window.location.origin}/#video-${post.id}`
    navigator.clipboard?.writeText(shareUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  return (
    <div className="yt-watch-container">
      {/* Top Banner Notice */}
      {notice && (
        <div className="yt-top-toast-notice">
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="yt-top-toast-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* =========================================================================
          TOP ACTION & SEARCH HEADER
          ========================================================================= */}
      <header className="yt-watch-header">
        <div className="yt-header-left">
          <div className="yt-logo-badge">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#e02424">
              <path d="M21.58 7.19a2.76 2.76 0 0 0-1.95-1.96C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.63.48A2.76 2.76 0 0 0 2.42 7.2 28.7 28.7 0 0 0 1.95 12c0 1.62.16 3.24.47 4.81.28.98 1.05 1.76 1.95 1.96 1.73.48 7.63.48 7.63.48s5.9 0 7.63-.48a2.76 2.76 0 0 0 1.95-1.96c.31-1.57.47-3.19.47-4.81s-.16-3.24-.47-4.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
            </svg>
            <div className="yt-logo-text">
              <strong>Watch & Videos</strong>
              <small>YouTube-style Video & Pages Hub</small>
            </div>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="yt-header-center">
          <div className="yt-search-input-wrap">
            <input
              type="text"
              placeholder="Search videos, pages, creators..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="yt-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
            <span className="yt-search-icon">
              <IconSearch size={15} />
            </span>
          </div>
        </div>

        {/* Right CTA Buttons: Open Page + Upload Video */}
        <div className="yt-header-right">
          <button
            type="button"
            className="yt-btn-open-page"
            onClick={() => {
              setPageError('')
              setIsOpenPageModal(true)
            }}
            title="Create a new Public or Private Page"
          >
            <IconPage size={15} />
            <span>Open a Page</span>
          </button>

          <button
            type="button"
            className="yt-btn-upload-video"
            onClick={() => handleOpenUploadModal()}
            title="Upload a new video to a page"
          >
            <IconVideoUpload size={17} />
            <span>Upload Video</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          CATEGORY & PRIVACY PILLS BAR
          ========================================================================= */}
      <div className="yt-categories-bar">
        <div className="yt-chips-scroll">
          {/* Privacy Quick Filter */}
          <button
            type="button"
            className={`yt-chip-pill ${privacyFilter === 'all' && selectedCategory === 'All' && !selectedPageSlug ? 'active' : ''}`}
            onClick={() => {
              setPrivacyFilter('all')
              setSelectedCategory('All')
              setSelectedPageSlug(null)
            }}
          >
            All Videos
          </button>

          <button
            type="button"
            className={`yt-chip-pill ${privacyFilter === 'public' ? 'active' : ''}`}
            onClick={() => {
              setPrivacyFilter(privacyFilter === 'public' ? 'all' : 'public')
              setSelectedPageSlug(null)
            }}
          >
            <IconGlobe size={13} />
            <span>Public Pages</span>
          </button>

          <button
            type="button"
            className={`yt-chip-pill ${privacyFilter === 'private' ? 'active' : ''}`}
            onClick={() => {
              setPrivacyFilter(privacyFilter === 'private' ? 'all' : 'private')
              setSelectedPageSlug(null)
            }}
          >
            <IconLock size={13} />
            <span>Private Pages</span>
          </button>

          <span className="yt-chip-divider" />

          {CATEGORIES.filter(c => c !== 'All').map(cat => (
            <button
              type="button"
              key={cat}
              className={`yt-chip-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat ? 'All' : cat)
                setSelectedPageSlug(null)
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          PAGES & CHANNELS SHOWCASE CAROUSEL
          ========================================================================= */}
      <section className="yt-channels-shelf">
        <div className="yt-shelf-header">
          <div className="yt-shelf-title">
            <span className="yt-shelf-icon">
              <IconTV size={17} />
            </span>
            <strong>Featured Pages & Channels</strong>
            <span className="yt-shelf-count">{pages.length} Pages</span>
          </div>
          {selectedPageSlug && (
            <button
              type="button"
              className="yt-view-all-link"
              onClick={() => setSelectedPageSlug(null)}
            >
              ← Back to All Videos
            </button>
          )}
        </div>

        <div className="yt-channels-grid-scroll">
          {pages.map(page => {
            const isSelected = selectedPageSlug?.toLowerCase() === page.slug.toLowerCase()
            const isPrivate = page.privacy_type === 'private'
            return (
              <div
                key={page.id}
                className={`yt-channel-card ${isSelected ? 'active-channel' : ''}`}
                onClick={() => setSelectedPageSlug(isSelected ? null : page.slug)}
              >
                <div className="yt-channel-avatar-wrap">
                  <UserAvatar
                    avatarUrl={page.avatar_url}
                    fallback={page.name}
                    size={46}
                  />
                  <span
                    className={`yt-privacy-badge-dot ${isPrivate ? 'private' : 'public'}`}
                    title={isPrivate ? 'Private Page (Only Admin Uploads)' : 'Public Page (Open Uploads)'}
                  >
                    {isPrivate ? <IconLock size={10} /> : <IconGlobe size={10} />}
                  </span>
                </div>
                <div className="yt-channel-info">
                  <strong className="yt-channel-name">{page.name}</strong>
                  <span className="yt-channel-handle">@{page.slug}</span>
                  <span className="yt-channel-meta">
                    {page.member_count} {page.member_count === 1 ? 'follower' : 'followers'} • {isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`yt-follow-btn ${page.is_member ? 'following' : ''}`}
                  onClick={e => {
                    e.stopPropagation()
                    handleToggleFollowPage(page.slug, page.is_member)
                  }}
                >
                  {page.is_member ? 'Following' : '+ Follow'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          SELECTED PAGE HERO BANNER
          ========================================================================= */}
      {activePageDetails && (
        <section className="yt-selected-page-banner">
          <div className="yt-page-banner-cover">
            {activePageDetails.banner_url ? (
              <img src={getMediaUrl(activePageDetails.banner_url)} alt="Cover" />
            ) : (
              <div className="yt-page-default-cover-pattern" />
            )}
          </div>
          <div className="yt-page-banner-body">
            <div className="yt-page-avatar-large">
              <UserAvatar
                avatarUrl={activePageDetails.avatar_url}
                fallback={activePageDetails.name}
                size={84}
              />
            </div>
            <div className="yt-page-main-details">
              <div className="yt-page-title-row">
                <h2>{activePageDetails.name}</h2>
                <span className={`yt-page-privacy-pill ${activePageDetails.privacy_type}`}>
                  {activePageDetails.privacy_type === 'private' ? (
                    <>
                      <IconLock size={12} />
                      <span>Private Page</span>
                    </>
                  ) : (
                    <>
                      <IconGlobe size={12} />
                      <span>Public Page</span>
                    </>
                  )}
                </span>
                {activePageDetails.is_admin && (
                  <span className="yt-page-admin-pill">
                    <IconShieldCheck size={12} />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="yt-page-handle-stats">
                @{activePageDetails.slug} • {activePageDetails.category || 'General'} • {activePageDetails.member_count} followers
              </p>
              {activePageDetails.description && (
                <p className="yt-page-desc-text">{activePageDetails.description}</p>
              )}

              <div className="yt-page-permission-notice">
                {activePageDetails.privacy_type === 'private' ? (
                  activePageDetails.can_upload_video ? (
                    <span className="notice-admin-ok">
                      <IconShieldCheck size={14} /> <strong>Admin Access:</strong> You can upload videos to this private page.
                    </span>
                  ) : (
                    <span className="notice-private-visitor">
                      <IconLock size={14} /> <strong>Private Page:</strong> Only the page admin can upload videos. You can watch, like, comment, and share all videos!
                    </span>
                  )
                ) : (
                  <span className="notice-public-ok">
                    <IconGlobe size={14} /> <strong>Public Page:</strong> All members can upload videos, like, comment, and share.
                  </span>
                )}
              </div>
            </div>

            <div className="yt-page-banner-actions">
              <button
                type="button"
                className={`button ${activePageDetails.is_member ? 'button-secondary' : 'button-primary'}`}
                onClick={() => handleToggleFollowPage(activePageDetails.slug, activePageDetails.is_member)}
              >
                {activePageDetails.is_member ? '✓ Following' : '+ Follow Page'}
              </button>

              {activePageDetails.can_upload_video && (
                <button
                  type="button"
                  className="button yt-btn-upload-direct"
                  onClick={() => handleOpenUploadModal(activePageDetails.slug)}
                >
                  <IconVideoUpload size={16} />
                  <span>Upload Video</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          YOUTUBE VIDEO FEED GRID
          ========================================================================= */}
      <main className="yt-video-feed-section">
        <div className="yt-feed-section-header">
          <h3>
            {selectedPageSlug
              ? `Videos from @${selectedPageSlug}`
              : selectedCategory !== 'All'
              ? `${selectedCategory} Videos`
              : 'Trending & Latest Videos'}
          </h3>
          <span className="yt-feed-counter">{filteredVideos.length} videos</span>
        </div>

        {loading ? (
          <div className="yt-feed-loading">
            <span className="spinner" />
            <p>Loading video library...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="yt-empty-feed">
            <div className="yt-empty-icon">
              <IconFilm size={48} />
            </div>
            <h4>No videos found</h4>
            <p>
              {selectedPageSlug
                ? `No videos uploaded to this page yet. Be the first to publish!`
                : searchQuery
                ? `No videos match "${searchQuery}". Try different keywords.`
                : `No videos available in this category yet.`}
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => handleOpenUploadModal(selectedPageSlug || undefined)}
            >
              + Upload the First Video
            </button>
          </div>
        ) : (
          <div className="yt-videos-grid">
            {filteredVideos.map(post => {
              const pagePrivacyType = post.community.privacy_type || 'public'
              const isPrivate = pagePrivacyType === 'private'
              return (
                <article key={post.id} className="yt-video-card">
                  {/* 16:9 Video Player / Thumbnail Preview */}
                  <div
                    className="yt-thumbnail-wrapper"
                    onClick={() => handleWatchVideo(post)}
                  >
                    <video
                      src={getMediaUrl(post.video_url)}
                      preload="metadata"
                      playsInline
                      muted
                      onMouseEnter={e => {
                        try {
                          e.currentTarget.play().catch(() => {})
                        } catch {}
                      }}
                      onMouseLeave={e => {
                        try {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        } catch {}
                      }}
                      className="yt-card-video-player"
                    />
                    <div className="yt-thumb-overlay">
                      <span className="yt-play-triangle">▶</span>
                    </div>
                    <span className="yt-duration-badge">HD</span>
                  </div>

                  {/* Card Body */}
                  <div className="yt-card-body">
                    <div
                      className="yt-card-avatar"
                      onClick={() => setSelectedPageSlug(post.community.slug)}
                      title={`View page @${post.community.slug}`}
                    >
                      <UserAvatar
                        avatarUrl={post.community.avatar_url || post.author.avatar_url}
                        fallback={post.community.name}
                        size={36}
                      />
                    </div>
                    <div className="yt-card-details">
                      <h4
                        className="yt-card-title"
                        onClick={() => handleWatchVideo(post)}
                        title={post.title}
                      >
                        {post.title}
                      </h4>

                      <div className="yt-card-channel-row">
                        <span
                          className="yt-card-channel-name"
                          onClick={() => setSelectedPageSlug(post.community.slug)}
                        >
                          {post.community.name}
                        </span>
                        <span
                          className={`yt-card-privacy-icon ${isPrivate ? 'private' : 'public'}`}
                          title={isPrivate ? 'Private Page' : 'Public Page'}
                        >
                          {isPrivate ? <IconLock size={12} /> : <IconGlobe size={12} />}
                        </span>
                      </div>

                      <div className="yt-card-meta-row">
                        <span>{formatViews(post.views_count || 0)}</span>
                        <span className="yt-bullet">•</span>
                        <span>{formatRelativeTime(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="yt-card-actions-bar">
                    <button
                      type="button"
                      className={`yt-action-pill ${post.has_upvoted ? 'active-liked' : ''}`}
                      onClick={() => handleToggleLike(post.id)}
                      title="Like / React"
                    >
                      <IconThumbUp size={14} active={post.has_upvoted} />
                      <span>{post.upvote_count}</span>
                    </button>

                    <button
                      type="button"
                      className="yt-action-pill"
                      onClick={() => handleWatchVideo(post)}
                      title="Comments"
                    >
                      <IconComment size={14} />
                      <span>{post.comment_count}</span>
                    </button>

                    <button
                      type="button"
                      className="yt-action-pill yt-share-pill"
                      onClick={() => setSharePost(post)}
                      title="Share Video"
                    >
                      <IconShare size={14} />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: YOUTUBE THEATER WATCH MODAL
          ========================================================================= */}
      {activeWatchPost && (
        <div className="yt-watch-modal-overlay" onClick={() => setActiveWatchPost(null)}>
          <div className="yt-watch-modal-content" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="yt-watch-close-btn"
              onClick={() => setActiveWatchPost(null)}
              aria-label="Close Watch Player"
            >
              ✕
            </button>

            <div className="yt-watch-modal-layout">
              {/* Left Column: Video Player & Details */}
              <div className="yt-watch-theater-left">
                <div className="yt-player-container">
                  <video
                    src={getMediaUrl(activeWatchPost.video_url)}
                    controls
                    autoPlay
                    playsInline
                    className="yt-theater-video"
                  />
                </div>

                <div className="yt-theater-info">
                  <h2 className="yt-theater-title">{activeWatchPost.title}</h2>

                  {/* Channel & Action Row */}
                  <div className="yt-theater-action-row">
                    <div className="yt-theater-channel-card">
                      <UserAvatar
                        avatarUrl={activeWatchPost.community.avatar_url || activeWatchPost.author.avatar_url}
                        fallback={activeWatchPost.community.name}
                        size={48}
                      />
                      <div className="yt-theater-channel-meta">
                        <strong
                          className="clickable-name"
                          onClick={() => {
                            setSelectedPageSlug(activeWatchPost.community.slug)
                            setActiveWatchPost(null)
                          }}
                        >
                          {activeWatchPost.community.name}
                        </strong>
                        <span className="yt-theater-channel-sub">
                          @{activeWatchPost.community.slug} • {activeWatchPost.community.privacy_type === 'private' ? 'Private Page' : 'Public Page'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`yt-theater-subscribe-btn ${activeWatchPost.community.is_member ? 'subscribed' : ''}`}
                        onClick={() => handleToggleFollowPage(activeWatchPost.community.slug, activeWatchPost.community.is_member)}
                      >
                        {activeWatchPost.community.is_member ? 'Following' : '+ Follow'}
                      </button>
                    </div>

                    <div className="yt-theater-buttons-group">
                      <button
                        type="button"
                        className={`yt-theater-pill-btn ${activeWatchPost.has_upvoted ? 'active-liked' : ''}`}
                        onClick={() => handleToggleLike(activeWatchPost.id)}
                      >
                        <IconThumbUp size={16} active={activeWatchPost.has_upvoted} />
                        <span>{activeWatchPost.upvote_count} Likes</span>
                      </button>

                      <button
                        type="button"
                        className="yt-theater-pill-btn"
                        onClick={() => setSharePost(activeWatchPost)}
                      >
                        <IconShare size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="yt-theater-description-box">
                    <div className="yt-theater-desc-header">
                      <strong>{formatViews(activeWatchPost.views_count || 0)}</strong>
                      <span className="yt-bullet">•</span>
                      <span>Uploaded {formatRelativeTime(activeWatchPost.created_at)}</span>
                      <span className="yt-bullet">•</span>
                      <span>By {activeWatchPost.author.name}</span>
                    </div>
                    {activeWatchPost.content && (
                      <p className="yt-theater-desc-body">{activeWatchPost.content}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Comments Section */}
              <div className="yt-watch-theater-right">
                <div className="yt-comments-panel">
                  <div className="yt-comments-header">
                    <h4>{commentsList.length} Comments</h4>
                  </div>

                  {/* Comment Input Box */}
                  <form onSubmit={handleAddComment} className="yt-comment-input-form">
                    <UserAvatar
                      avatarUrl={user.avatar_url}
                      fallback={user.username}
                      size={32}
                    />
                    <div className="yt-comment-input-field">
                      <input
                        type="text"
                        placeholder="Add a public comment..."
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                      />
                      {newCommentText.trim() && (
                        <div className="yt-comment-submit-row">
                          <button
                            type="button"
                            className="yt-comment-cancel"
                            onClick={() => setNewCommentText('')}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingComment}
                            className="yt-comment-submit"
                          >
                            {submittingComment ? 'Posting...' : 'Comment'}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>

                  {/* Comments Thread List */}
                  <div className="yt-comments-scroll-list">
                    {commentsList.length === 0 ? (
                      <p className="yt-no-comments">No comments yet. Say something nice!</p>
                    ) : (
                      commentsList.map(comment => (
                        <div key={comment.id} className="yt-comment-item">
                          <UserAvatar
                            avatarUrl={comment.author.avatar_url}
                            fallback={comment.author.username}
                            size={32}
                          />
                          <div className="yt-comment-item-body">
                            <div className="yt-comment-item-header">
                              <strong
                                className="yt-comment-user"
                                onClick={() => {
                                  setActiveWatchPost(null)
                                  onOpenProfile?.(comment.author.username)
                                }}
                              >
                                {comment.author.name}
                              </strong>
                              <span className="yt-comment-time">
                                {formatRelativeTime(comment.created_at)}
                              </span>
                            </div>
                            <p className="yt-comment-text">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: "OPEN A PAGE" MODAL (SOLID OPAQUE WHITE / DARK BACKGROUND)
          ========================================================================= */}
      {isOpenPageModal && (
        <div className="yt-modal-overlay" onClick={() => setIsOpenPageModal(false)}>
          <div className="yt-modal-box yt-page-create-modal" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title">
                <span className="modal-title-icon">
                  <IconPage size={20} />
                </span>
                <div>
                  <h3>Open a New Page</h3>
                  <small>Create your video channel & build a community</small>
                </div>
              </div>
              <button
                type="button"
                className="yt-modal-close"
                onClick={() => setIsOpenPageModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {pageError && (
              <div className="yt-modal-error-banner">
                <span>{pageError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePageSubmit} className="yt-modal-form">
              {/* Page Name */}
              <div className="form-group">
                <label>Page / Channel Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Radar BD, Daily Gaming, Travel Vibes"
                  value={pageName}
                  onChange={e => {
                    setPageName(e.target.value)
                    if (!pageSlug) {
                      setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30))
                    }
                  }}
                  required
                />
              </div>

              {/* Page Slug */}
              <div className="form-group">
                <label>Page Handle / Slug *</label>
                <div className="slug-input-prefix-wrap">
                  <span className="slug-prefix">@</span>
                  <input
                    type="text"
                    placeholder="my_channel_handle"
                    value={pageSlug}
                    onChange={e => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                  />
                </div>
                <small className="field-hint">Only lowercase letters, numbers, and underscores.</small>
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={pageCategory}
                  onChange={e => setPageCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* PRIVACY SELECTION: Public vs Private */}
              <div className="form-group">
                <label className="section-label">Privacy Mode (Video Upload Permission) *</label>
                <div className="yt-privacy-cards-grid">
                  {/* Public Page Card */}
                  <div
                    className={`yt-privacy-card ${pagePrivacy === 'public' ? 'selected' : ''}`}
                    onClick={() => setPagePrivacy('public')}
                  >
                    <div className="privacy-card-header">
                      <span className="privacy-icon-globe">
                        <IconGlobe size={20} />
                      </span>
                      <div>
                        <strong>Public Page</strong>
                        <span className="privacy-tag public">Open Uploads</span>
                      </div>
                      <input
                        type="radio"
                        checked={pagePrivacy === 'public'}
                        onChange={() => setPagePrivacy('public')}
                      />
                    </div>
                    <p className="privacy-card-desc">
                      Anyone can follow, and <strong>all page members can upload videos</strong> to this page. Ideal for collaborative groups & community channels.
                    </p>
                  </div>

                  {/* Private Page Card */}
                  <div
                    className={`yt-privacy-card ${pagePrivacy === 'private' ? 'selected' : ''}`}
                    onClick={() => setPagePrivacy('private')}
                  >
                    <div className="privacy-card-header">
                      <span className="privacy-icon-lock">
                        <IconLock size={20} />
                      </span>
                      <div>
                        <strong>Private Page</strong>
                        <span className="privacy-tag private">Admin Only Uploads</span>
                      </div>
                      <input
                        type="radio"
                        checked={pagePrivacy === 'private'}
                        onChange={() => setPagePrivacy('private')}
                      />
                    </div>
                    <p className="privacy-card-desc">
                      Anyone can watch, like, comment & share, BUT <strong>only you (Page Admin) can upload videos</strong>. Ideal for personal creators & brands.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Page Description & Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell viewers what your page is about..."
                  value={pageDescription}
                  onChange={e => setPageDescription(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="yt-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsOpenPageModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPage}
                  className="button button-primary"
                >
                  {submittingPage ? 'Creating Page...' : 'Create Page Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: YOUTUBE VIDEO UPLOAD MODAL
          ========================================================================= */}
      {isUploadVideoModal && (
        <div className="yt-modal-overlay" onClick={() => !uploadingVideo && setIsUploadVideoModal(false)}>
          <div className="yt-modal-box yt-upload-video-modal" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title">
                <span className="modal-title-icon">
                  <IconVideoUpload size={20} />
                </span>
                <div>
                  <h3>Upload Video</h3>
                  <small>Publish a video to your page (YouTube style)</small>
                </div>
              </div>
              <button
                type="button"
                className="yt-modal-close"
                disabled={uploadingVideo}
                onClick={() => setIsUploadVideoModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="yt-modal-error-banner">
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadVideoSubmit} className="yt-modal-form">
              {/* 1. Target Page Selection (User MUST have a page to upload) */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Select Your Page / Channel *</label>
                  <button
                    type="button"
                    className="yt-view-all-link"
                    style={{ fontSize: '11.5px' }}
                    onClick={() => {
                      setIsUploadVideoModal(false)
                      setIsOpenPageModal(true)
                    }}
                  >
                    + Open Another Page
                  </button>
                </div>

                {myPages.length === 0 ? (
                  <div className="yt-no-pages-alert">
                    <p>You must open a Page first to upload videos! Personal account video uploads are not allowed in Watch.</p>
                    <button
                      type="button"
                      className="button button-primary button-small"
                      onClick={() => {
                        setIsUploadVideoModal(false)
                        setIsOpenPageModal(true)
                      }}
                    >
                      + Open a Page Now
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={uploadTargetSlug}
                      onChange={e => setUploadTargetSlug(e.target.value)}
                      required
                    >
                      {myPages.map(p => {
                        const isPrivate = p.privacy_type === 'private'
                        return (
                          <option
                            key={p.id}
                            value={p.slug}
                          >
                            {p.name} (@{p.slug}) — {isPrivate ? 'Private Page' : 'Public Page'}
                          </option>
                        )
                      })}
                    </select>

                    <div className="yt-upload-channel-note">
                      <IconPage size={13} />
                      <span>
                        This video will be published under your Page <strong>@{uploadTargetSlug}</strong> and will also appear on your personal profile timeline.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 2. Video File Picker */}
              <div className="form-group">
                <label>Select Video File (MP4, WebM, MOV - Max 250MB) *</label>
                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={handleVideoFileSelect}
                  style={{ display: 'none' }}
                />

                {!selectedVideoFile ? (
                  <div
                    className="yt-dropzone"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <div className="dropzone-icon">
                      <IconUploadCloud size={46} />
                    </div>
                    <strong>Click or drag video here to upload</strong>
                    <p>Supports MP4, WebM, MOV format up to 1080p</p>
                    <button type="button" className="button button-secondary button-small">
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <div className="yt-selected-file-preview">
                    {videoPreviewUrl && (
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="yt-upload-preview-player"
                      />
                    )}
                    <div className="yt-file-meta-bar">
                      <div className="file-info">
                        <strong>{selectedVideoFile.name}</strong>
                        <span>{(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <button
                        type="button"
                        className="button button-danger button-small"
                        onClick={() => {
                          setSelectedVideoFile(null)
                          if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
                          setVideoPreviewUrl(null)
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Title */}
              <div className="form-group">
                <label>Video Title *</label>
                <input
                  type="text"
                  placeholder="Add a captivating video title..."
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  required
                />
              </div>

              {/* 4. Description */}
              <div className="form-group">
                <label>Video Description & Tags</label>
                <textarea
                  rows={3}
                  placeholder="Tell viewers what your video is about, links, hashtags..."
                  value={videoDescription}
                  onChange={e => setVideoDescription(e.target.value)}
                />
              </div>

              {/* Uploading Status Bar */}
              {uploadingVideo && (
                <div className="yt-upload-progress-box">
                  <div className="progress-spinner-row">
                    <span className="spinner" />
                    <strong>Uploading and encoding 1080p video...</strong>
                  </div>
                  <p>Please do not close this window while your video is processing.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="yt-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={uploadingVideo}
                  onClick={() => setIsUploadVideoModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingVideo || !selectedVideoFile || !videoTitle.trim()}
                  className="button button-primary yt-upload-submit-btn"
                >
                  {uploadingVideo ? 'Uploading Video...' : 'Publish Video Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SHARE MODAL
          ========================================================================= */}
      {sharePost && (
        <div className="yt-modal-overlay" onClick={() => setSharePost(null)}>
          <div className="yt-modal-box yt-share-modal" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title">
                <span className="modal-title-icon">
                  <IconShare size={18} />
                </span>
                <div>
                  <h3>Share this Video</h3>
                  <small>{sharePost.title}</small>
                </div>
              </div>
              <button
                type="button"
                className="yt-modal-close"
                onClick={() => setSharePost(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="yt-share-modal-body">
              {/* Copy Direct Link */}
              <div className="yt-share-link-group">
                <label>Direct Video Link</label>
                <div className="yt-share-input-row">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#video-${sharePost.id}`}
                  />
                  <button
                    type="button"
                    className={`button ${copiedLink ? 'button-success' : 'button-primary'}`}
                    onClick={() => handleCopyShareLink(sharePost)}
                  >
                    {copiedLink ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Quick Share Targets */}
              <div className="yt-share-options-grid">
                <div
                  className="yt-share-target-item"
                  onClick={() => {
                    handleCopyShareLink(sharePost)
                    setNotice('Link copied! You can now paste and share in Group Chat.')
                    setSharePost(null)
                  }}
                >
                  <span className="target-icon">
                    <IconChatDots size={24} />
                  </span>
                  <strong>Chat / Messenger</strong>
                  <small>Share in group chats</small>
                </div>

                <div
                  className="yt-share-target-item"
                  onClick={() => {
                    handleCopyShareLink(sharePost)
                    setNotice('Link copied! Paste into News Feed to share with friends.')
                    setSharePost(null)
                  }}
                >
                  <span className="target-icon">
                    <IconFeedNewspaper size={24} />
                  </span>
                  <strong>News Feed</strong>
                  <small>Share on timeline</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

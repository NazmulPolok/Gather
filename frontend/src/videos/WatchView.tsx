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

function IconStudioUpload({ size = 72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" stroke="#2563eb" fill="rgba(37, 99, 235, 0.08)" />
      <path d="M12 16V8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      <path d="m8.5 11.5 3.5-3.5 3.5 3.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheckSuccess({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconCopyBtn({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function IconDashboard({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function IconChartAnalytics({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconVideoList({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" />
    </svg>
  )
}

function IconTrash({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function IconEye({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconUsers({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
  const [pageDescription, setPageDescription] = useState('')
  const [submittingPage, setSubmittingPage] = useState(false)
  const [pageError, setPageError] = useState('')

  // Upload Video Modal state (YouTube Studio Style)
  const [isUploadVideoModal, setIsUploadVideoModal] = useState(false)
  const [uploadTargetSlug, setUploadTargetSlug] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [videoCategory, setVideoCategory] = useState('Tech & Gadgets')
  const [videoTags, setVideoTags] = useState('')
  const [videoAudience, setVideoAudience] = useState<'not-for-kids' | 'kids'>('not-for-kids')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [copiedPreviewLink, setCopiedPreviewLink] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Share Modal state
  const [sharePost, setSharePost] = useState<PostItem | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // YouTube Studio Dashboard Mode state
  const [viewMode, setViewMode] = useState<'feed' | 'dashboard'>('feed')
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'content' | 'analytics' | 'comments'>('overview')
  const [dashboardChannelSlug, setDashboardChannelSlug] = useState<string>('')
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)

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
        api.getNewsFeed(token, { limit: 100, source: 'watch' }),
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

  // User's own channels (only channel owners/admins can upload videos, like YouTube)
  const myPages = useMemo(() => {
    return pages.filter(p => p.is_admin || p.can_upload_video)
  }, [pages])

  const handleOpenUploadModal = (preferredSlug?: string) => {
    setUploadError('')
    if (preferredSlug && myPages.some(p => p.slug === preferredSlug)) {
      setUploadTargetSlug(preferredSlug)
    } else if (myPages.length > 0) {
      if (!uploadTargetSlug || !myPages.some(p => p.slug === uploadTargetSlug)) {
        setUploadTargetSlug(myPages[0].slug)
      }
    } else {
      setUploadTargetSlug(user.username)
    }
    setIsUploadVideoModal(true)
  }

  // All video posts uploaded from YouTube channels / Watch Studio
  const videoPosts = useMemo(() => {
    return posts.filter(p => Boolean(p.video_url) && p.source === 'watch')
  }, [posts])

  // Active channel slug in Studio Dashboard
  const activeDashboardSlug = useMemo(() => {
    if (dashboardChannelSlug) return dashboardChannelSlug
    if (myPages.length > 0) return myPages[0].slug
    return user.username
  }, [dashboardChannelSlug, myPages, user.username])

  // Active channel community object
  const activeDashboardChannel = useMemo(() => {
    return pages.find(p => p.slug.toLowerCase() === activeDashboardSlug.toLowerCase()) || null
  }, [pages, activeDashboardSlug])

  // Videos belonging to active channel
  const channelVideos = useMemo(() => {
    return videoPosts.filter(p => {
      if (activeDashboardChannel) {
        return p.community.slug.toLowerCase() === activeDashboardSlug.toLowerCase()
      }
      return p.author.username.toLowerCase() === user.username.toLowerCase()
    })
  }, [videoPosts, activeDashboardSlug, activeDashboardChannel, user.username])

  // Latest uploaded video
  const latestVideo = useMemo(() => {
    return channelVideos.length > 0 ? channelVideos[0] : null
  }, [channelVideos])

  // Analytics totals
  const totalViews = useMemo(() => {
    return channelVideos.reduce((acc, v) => acc + (v.views_count || 0), 0)
  }, [channelVideos])

  const totalLikes = useMemo(() => {
    return channelVideos.reduce((acc, v) => acc + (v.upvote_count || 0), 0)
  }, [channelVideos])

  const totalComments = useMemo(() => {
    return channelVideos.reduce((acc, v) => acc + (v.comment_count || 0), 0)
  }, [channelVideos])

  // All comments on channel videos
  const channelComments = useMemo(() => {
    const list: { comment: CommentItem; video: PostItem }[] = []
    channelVideos.forEach(v => {
      (v.comments || []).forEach(c => {
        list.push({ comment: c, video: v })
      })
    })
    return list.sort((a, b) => new Date(b.comment.created_at).getTime() - new Date(a.comment.created_at).getTime())
  }, [channelVideos])

  // Delete video from channel
  const handleDeleteVideo = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this video? This cannot be undone.')) {
      return
    }
    setDeletingPostId(postId)
    try {
      await api.deletePost(token, postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      if (activeWatchPost?.id === postId) {
        setActiveWatchPost(null)
      }
      setNotice('Video deleted successfully!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete video')
    } finally {
      setDeletingPostId(null)
    }
  }

  // Filtered video posts
  const filteredVideos = useMemo(() => {
    return videoPosts.filter(p => {
      // 1. Page filter
      if (selectedPageSlug && p.community.slug.toLowerCase() !== selectedPageSlug.toLowerCase()) {
        return false
      }
      // 2. Category filter
      if (selectedCategory !== 'All') {
        const commCat = p.community.category || 'General'
        if (selectedCategory === 'My Pages') {
          if (!p.community.is_admin && p.author.username !== user.username) return false
        } else if (commCat !== selectedCategory) {
          return false
        }
      }
      // 3. Search query
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
  }, [videoPosts, selectedPageSlug, selectedCategory, searchQuery, user.username])

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
        'private',
        'open',
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

  // Process selected video file (common for file picker & drag-and-drop)
  const processVideoFile = (file: File) => {
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
    // Auto populate title from filename if title is blank
    if (!videoTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setVideoTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }

  // Handle Video File Select
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processVideoFile(file)
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

    const effectiveSlug = uploadTargetSlug || (myPages[0]?.slug ?? user.username)

    const targetPage = pages.find(p => p.slug === effectiveSlug)
    if (targetPage && targetPage.privacy_type !== 'private') {
      setUploadError('In Watch, videos can only be uploaded to Private Pages by the page holder.')
      return
    }
    if (targetPage && !targetPage.can_upload_video && !targetPage.is_admin) {
      setUploadError('Only the channel owner (admin) can upload videos to this channel.')
      return
    }

    setUploadingVideo(true)
    setUploadError('')
    try {
      const uploadRes = await api.uploadPostMedia(token, selectedVideoFile)
      if (!uploadRes.video_url) {
        throw new Error('Video upload failed on the server.')
      }

      let finalContent = videoDescription.trim()
      if (videoTags.trim()) {
        const formattedTags = videoTags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .map(t => (t.startsWith('#') ? t : `#${t}`))
          .join(' ')
        finalContent = finalContent ? `${finalContent}\n\n${formattedTags}` : formattedTags
      }

      const createdPost = await api.createPost(token, {
        community_slug: effectiveSlug,
        title: videoTitle.trim(),
        content: finalContent || undefined,
        video_url: uploadRes.video_url,
        source: 'watch',
      })

      // Refresh pages list in case user's personal channel was created
      fetchAllData()

      setIsUploadVideoModal(false)
      setSelectedVideoFile(null)
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(null)
      setVideoTitle('')
      setVideoDescription('')
      setVideoTags('')
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
        {/* Left Side: Feed vs Studio Dashboard Tabs */}
        <div className="yt-header-left-tabs">
          <button
            type="button"
            className={`yt-tab-switch-btn ${viewMode === 'feed' ? 'active' : ''}`}
            onClick={() => setViewMode('feed')}
            title="Browse all videos"
          >
            <IconTV size={16} />
            <span>Watch Feed</span>
          </button>
          <button
            type="button"
            className={`yt-tab-switch-btn yt-studio-tab-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('dashboard')
              if (!dashboardChannelSlug && myPages.length > 0) {
                setDashboardChannelSlug(myPages[0].slug)
              } else if (!dashboardChannelSlug) {
                setDashboardChannelSlug(user.username)
              }
            }}
            title="Open YouTube Studio Channel Dashboard"
          >
            <IconDashboard size={16} />
            <span>Studio Dashboard</span>
          </button>
        </div>

        {/* Search Input (Shown when in feed mode) */}
        {viewMode === 'feed' && (
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
        )}

        {/* Right CTA Buttons: Open Page + Upload Video */}
        <div className="yt-header-right">
          <button
            type="button"
            className="yt-btn-open-page"
            onClick={() => {
              setPageError('')
              setIsOpenPageModal(true)
            }}
            title="Create a new Channel / Page"
          >
            <IconPage size={15} />
            <span>Open a Page</span>
          </button>

          <button
            type="button"
            className="yt-btn-upload-video"
            onClick={() => handleOpenUploadModal(viewMode === 'dashboard' ? activeDashboardSlug : undefined)}
            title="Upload a new video to a page"
          >
            <IconVideoUpload size={17} />
            <span>Upload Video</span>
          </button>
        </div>
      </header>

      {viewMode === 'dashboard' ? (
        /* =========================================================================
           YOUTUBE STUDIO CREATOR DASHBOARD
           ========================================================================= */
        <section className="yt-studio-dashboard-view">
          {/* 1. Channel Header Card */}
          <div className="yt-studio-channel-hero">
            <div className="yt-channel-hero-left">
              <div className="yt-channel-hero-avatar">
                <UserAvatar
                  avatarUrl={activeDashboardChannel?.avatar_url || user.avatar_url}
                  fallback={activeDashboardChannel?.name || `${user.first_name} ${user.last_name}`.trim() || user.username}
                  size={52}
                />
              </div>
              <div className="yt-channel-hero-info">
                <div className="yt-channel-title-row">
                  <h2>{activeDashboardChannel?.name || `${user.first_name} ${user.last_name}`.trim() || user.username}</h2>
                  <span className="yt-studio-badge">Creator Channel</span>
                </div>
                <div className="yt-channel-sub-row">
                  <span className="channel-handle">@{activeDashboardSlug}</span>
                  <span className="channel-dot">•</span>
                  <span>{activeDashboardChannel?.member_count ?? 1} {((activeDashboardChannel?.member_count ?? 1) === 1) ? 'Subscriber' : 'Subscribers'}</span>
                  <span className="channel-dot">•</span>
                  <span>{channelVideos.length} {channelVideos.length === 1 ? 'Video' : 'Videos'}</span>
                </div>
              </div>
            </div>

            <div className="yt-channel-hero-right">
              {/* Channel Selector Dropdown */}
              <div className="yt-studio-channel-selector">
                <label>Active Channel:</label>
                <select
                  value={activeDashboardSlug}
                  onChange={e => setDashboardChannelSlug(e.target.value)}
                  className="yt-studio-hero-select"
                >
                  <option value={user.username}>Personal Channel (@{user.username})</option>
                  {myPages.map(p => (
                    <option key={p.id} value={p.slug}>
                      {p.name} (@{p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={() => handleOpenUploadModal(activeDashboardSlug)}
              >
                <IconVideoUpload size={16} />
                <span>Upload to Channel</span>
              </button>
            </div>
          </div>

          {/* 2. Studio Subnav Tabs */}
          <div className="yt-studio-subnav-tabs">
            <button
              type="button"
              className={`yt-studio-subnav-pill ${dashboardTab === 'overview' ? 'active' : ''}`}
              onClick={() => setDashboardTab('overview')}
            >
              <IconDashboard size={15} />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`yt-studio-subnav-pill ${dashboardTab === 'content' ? 'active' : ''}`}
              onClick={() => setDashboardTab('content')}
            >
              <IconVideoList size={15} />
              <span>Content ({channelVideos.length})</span>
            </button>
            <button
              type="button"
              className={`yt-studio-subnav-pill ${dashboardTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setDashboardTab('analytics')}
            >
              <IconChartAnalytics size={15} />
              <span>Analytics</span>
            </button>
            <button
              type="button"
              className={`yt-studio-subnav-pill ${dashboardTab === 'comments' ? 'active' : ''}`}
              onClick={() => setDashboardTab('comments')}
            >
              <IconComment size={15} />
              <span>Comments ({channelComments.length})</span>
            </button>
          </div>

          {/* 3. Subnav Views */}
          {dashboardTab === 'overview' && (
            <div className="yt-studio-dashboard-content">
              {/* Metric KPI cards */}
              <div className="yt-studio-kpi-grid">
                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                    <IconUsers size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Subscribers</span>
                    <strong className="kpi-number">{activeDashboardChannel?.member_count ?? 1}</strong>
                    <span className="kpi-trend">+1 this month</span>
                  </div>
                </div>

                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <IconEye size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Total Views</span>
                    <strong className="kpi-number">{totalViews}</strong>
                    <span className="kpi-trend">All-time lifetime</span>
                  </div>
                </div>

                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <IconThumbUp size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Total Likes</span>
                    <strong className="kpi-number">{totalLikes}</strong>
                    <span className="kpi-trend">Viewer engagement</span>
                  </div>
                </div>

                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <IconVideoList size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Published Videos</span>
                    <strong className="kpi-number">{channelVideos.length}</strong>
                    <span className="kpi-trend">1080p Full HD</span>
                  </div>
                </div>
              </div>

              {/* YouTube Studio Dashboard 2-column cards layout */}
              <div className="yt-studio-cards-row">
                {/* Left Card: Latest Video Performance */}
                <div className="yt-studio-widget-card yt-latest-video-card">
                  <div className="widget-header">
                    <h4>Latest video performance</h4>
                    {latestVideo && <span className="widget-tag">Published</span>}
                  </div>

                  {latestVideo ? (
                    <div className="latest-video-content">
                      <div className="latest-video-preview" onClick={() => handleWatchVideo(latestVideo)}>
                        <video src={getMediaUrl(latestVideo.video_url || '')} preload="metadata" />
                        <div className="latest-video-play-overlay">
                          <span>▶ Watch</span>
                        </div>
                        <span className="yt-badge-resolution" style={{ position: 'absolute', top: 6, right: 6 }}>1080p FHD</span>
                      </div>

                      <div className="latest-video-info">
                        <strong className="video-title" title={latestVideo.title}>{latestVideo.title}</strong>
                        <span className="video-date">Published {formatRelativeTime(latestVideo.created_at)}</span>

                        <div className="latest-video-stats-table">
                          <div className="stats-row">
                            <span>Ranking by views</span>
                            <strong>#1 of {channelVideos.length}</strong>
                          </div>
                          <div className="stats-row">
                            <span>Views</span>
                            <strong>{latestVideo.views_count}</strong>
                          </div>
                          <div className="stats-row">
                            <span>Likes</span>
                            <strong>{latestVideo.upvote_count}</strong>
                          </div>
                          <div className="stats-row">
                            <span>Comments</span>
                            <strong>{latestVideo.comment_count}</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="button button-secondary button-small"
                          style={{ marginTop: 12, width: '100%' }}
                          onClick={() => handleWatchVideo(latestVideo)}
                        >
                          Go to Video Player & Comments
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="widget-empty-card">
                      <IconFilm size={40} />
                      <p>Upload a video to see real-time analytics and audience performance here.</p>
                      <button
                        type="button"
                        className="button button-primary button-small"
                        onClick={() => handleOpenUploadModal(activeDashboardSlug)}
                      >
                        Upload Video Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Card: Channel Analytics & Top Content */}
                <div className="yt-studio-widget-card">
                  <div className="widget-header">
                    <h4>Channel analytics</h4>
                    <span className="widget-sub">Current subscribers</span>
                  </div>

                  <div className="analytics-summary-box">
                    <span className="analytics-sub-number">{activeDashboardChannel?.member_count ?? 1}</span>
                    <span className="analytics-sub-delta">+1 in last 28 days</span>
                  </div>

                  <hr className="widget-divider" />

                  <div className="analytics-top-header">
                    <strong>Top performing videos</strong>
                    <small>Lifetime views</small>
                  </div>

                  {channelVideos.length === 0 ? (
                    <p className="widget-empty-text">No videos published yet.</p>
                  ) : (
                    <div className="analytics-top-list">
                      {channelVideos.slice(0, 4).map((vid, i) => (
                        <div key={vid.id} className="top-video-item" onClick={() => handleWatchVideo(vid)}>
                          <span className="item-rank">#{i + 1}</span>
                          <div className="item-details">
                            <span className="item-title" title={vid.title}>{vid.title}</span>
                            <span className="item-date">{formatRelativeTime(vid.created_at)}</span>
                          </div>
                          <div className="item-numbers">
                            <strong>{vid.views_count}</strong>
                            <small>views</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="yt-view-all-link"
                    style={{ marginTop: 'auto', paddingTop: 14 }}
                    onClick={() => setDashboardTab('analytics')}
                  >
                    Go to Channel Analytics →
                  </button>
                </div>
              </div>

              {/* Bottom Cards: Recent Comments & Creator Guide */}
              <div className="yt-studio-cards-row" style={{ marginTop: 20 }}>
                {/* Comments Widget */}
                <div className="yt-studio-widget-card">
                  <div className="widget-header">
                    <h4>Recent comments</h4>
                    <span className="widget-sub">{channelComments.length} total</span>
                  </div>

                  {channelComments.length === 0 ? (
                    <div className="widget-empty-card">
                      <IconComment size={36} />
                      <p>No comments on this channel yet. When viewers comment on your videos, they'll show up here.</p>
                    </div>
                  ) : (
                    <div className="recent-comments-list">
                      {channelComments.slice(0, 4).map(({ comment, video }) => (
                        <div key={comment.id} className="recent-comment-item">
                          <UserAvatar
                            avatarUrl={comment.author.avatar_url}
                            fallback={comment.author.name || comment.author.username}
                            size={34}
                          />
                          <div className="comment-body-col">
                            <div className="comment-meta-row">
                              <strong>{comment.author.name || comment.author.username}</strong>
                              <span>@{comment.author.username}</span>
                              <span className="comment-dot">•</span>
                              <span className="comment-time">{formatRelativeTime(comment.created_at)}</span>
                            </div>
                            <p className="comment-text-preview">{comment.content}</p>
                            <span className="comment-on-video" onClick={() => handleWatchVideo(video)}>
                              on <em>"{video.title}"</em>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Creator Insider Card */}
                <div className="yt-studio-widget-card">
                  <div className="widget-header">
                    <h4>Creator Insider & Best Practices</h4>
                  </div>
                  <div className="creator-tips-list">
                    <div className="tip-item">
                      <span className="tip-badge">1080p FHD</span>
                      <div>
                        <strong>Automatic Full HD Encoding</strong>
                        <p>All videos uploaded are encoded in crisp 1080p Full HD format to deliver smooth playback.</p>
                      </div>
                    </div>
                    <div className="tip-item">
                      <span className="tip-badge">Tags & SEO</span>
                      <div>
                        <strong>Add Search Tags</strong>
                        <p>Include tags and descriptive keywords during upload so viewers can discover your channel.</p>
                      </div>
                    </div>
                    <div className="tip-item">
                      <span className="tip-badge">Community</span>
                      <div>
                        <strong>Engage with Viewers</strong>
                        <p>Reply to comments and share your video links directly into Gather chats and feeds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT TAB: Full Video Manager Table */}
          {dashboardTab === 'content' && (
            <div className="yt-studio-content-view">
              <div className="content-view-header">
                <div>
                  <h3>Channel content</h3>
                  <p>Manage, play, copy links, or delete your published videos.</p>
                </div>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleOpenUploadModal(activeDashboardSlug)}
                >
                  <IconVideoUpload size={16} />
                  <span>Upload Video</span>
                </button>
              </div>

              {channelVideos.length === 0 ? (
                <div className="yt-empty-feed" style={{ marginTop: 40 }}>
                  <IconFilm size={48} />
                  <h4>No videos uploaded yet</h4>
                  <p>Start uploading videos to manage your channel content here.</p>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => handleOpenUploadModal(activeDashboardSlug)}
                  >
                    Upload Video Now
                  </button>
                </div>
              ) : (
                <div className="yt-studio-table-container">
                  <table className="yt-studio-table">
                    <thead>
                      <tr>
                        <th>Video</th>
                        <th>Visibility</th>
                        <th>Date</th>
                        <th>Views</th>
                        <th>Comments</th>
                        <th>Likes</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelVideos.map(video => (
                        <tr key={video.id}>
                          {/* Video thumbnail + Title */}
                          <td className="video-cell">
                            <div className="mini-thumb-wrap" onClick={() => handleWatchVideo(video)}>
                              <video src={getMediaUrl(video.video_url || '')} preload="metadata" />
                              <span className="mini-play-icon">▶</span>
                            </div>
                            <div className="video-title-col">
                              <strong className="table-video-title" onClick={() => handleWatchVideo(video)} title={video.title}>
                                {video.title}
                              </strong>
                              <small className="table-video-desc">
                                {video.content ? video.content.slice(0, 60) + (video.content.length > 60 ? '...' : '') : 'No description'}
                              </small>
                            </div>
                          </td>

                          {/* Visibility */}
                          <td>
                            <span className="visibility-badge">
                              <IconCheckSuccess size={12} />
                              <span>Published</span>
                            </span>
                          </td>

                          {/* Date */}
                          <td className="date-cell">
                            <span>{new Date(video.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <small>{formatRelativeTime(video.created_at)}</small>
                          </td>

                          {/* Views */}
                          <td><strong>{video.views_count}</strong></td>

                          {/* Comments */}
                          <td>{video.comment_count}</td>

                          {/* Likes */}
                          <td>{video.upvote_count}</td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-row">
                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => handleWatchVideo(video)}
                                title="Watch Video"
                              >
                                ▶
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn"
                                onClick={() => handleCopyShareLink(video)}
                                title="Copy Video Link"
                              >
                                <IconCopyBtn size={14} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn delete-btn"
                                disabled={deletingPostId === video.id}
                                onClick={() => handleDeleteVideo(video.id)}
                                title="Delete Video"
                              >
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {dashboardTab === 'analytics' && (
            <div className="yt-studio-analytics-view">
              <div className="analytics-hero-banner">
                <h3>Channel Analytics</h3>
                <p>Your channel got <strong>{totalViews} views</strong> across <strong>{channelVideos.length} videos</strong>.</p>
              </div>

              <div className="yt-studio-kpi-grid" style={{ marginBottom: 24 }}>
                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                    <IconEye size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Views</span>
                    <strong className="kpi-number">{totalViews}</strong>
                    <span className="kpi-trend">100% organic</span>
                  </div>
                </div>

                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <IconUsers size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Subscribers</span>
                    <strong className="kpi-number">{activeDashboardChannel?.member_count ?? 1}</strong>
                    <span className="kpi-trend">Channel community</span>
                  </div>
                </div>

                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <IconThumbUp size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Likes Rate</span>
                    <strong className="kpi-number">{totalLikes}</strong>
                    <span className="kpi-trend">Positive reactions</span>
                  </div>
                </div>

                <div className="yt-studio-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <IconComment size={20} />
                  </div>
                  <div className="kpi-body">
                    <span className="kpi-label">Audience Comments</span>
                    <strong className="kpi-number">{totalComments}</strong>
                    <span className="kpi-trend">Community interaction</span>
                  </div>
                </div>
              </div>

              {/* Performance Rankings Table */}
              <div className="yt-studio-widget-card" style={{ padding: 24 }}>
                <h4 style={{ marginBottom: 16 }}>Video Performance Rankings</h4>
                {channelVideos.length === 0 ? (
                  <p className="widget-empty-text">No videos to display analytics for.</p>
                ) : (
                  <div className="yt-studio-table-container">
                    <table className="yt-studio-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Video Title</th>
                          <th>Views</th>
                          <th>Likes</th>
                          <th>Comments</th>
                          <th>Engagement Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...channelVideos].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).map((v, idx) => (
                          <tr key={v.id}>
                            <td><strong>#{idx + 1}</strong></td>
                            <td style={{ cursor: 'pointer' }} onClick={() => handleWatchVideo(v)}>
                              <strong style={{ color: '#2563eb' }}>{v.title}</strong>
                            </td>
                            <td>{v.views_count} views</td>
                            <td>{v.upvote_count} likes</td>
                            <td>{v.comment_count} comments</td>
                            <td>
                              <span className="engagement-chip">
                                {(((v.upvote_count + v.comment_count) / Math.max(1, v.views_count ?? 0)) * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMMENTS TAB */}
          {dashboardTab === 'comments' && (
            <div className="yt-studio-comments-view">
              <div className="content-view-header">
                <div>
                  <h3>Channel Comments</h3>
                  <p>All comments left across your published videos.</p>
                </div>
              </div>

              {channelComments.length === 0 ? (
                <div className="widget-empty-card" style={{ padding: 48 }}>
                  <IconComment size={48} />
                  <h4>No comments yet</h4>
                  <p>When viewers leave comments on your videos, they will appear here so you can read and engage.</p>
                </div>
              ) : (
                <div className="full-comments-list">
                  {channelComments.map(({ comment, video }) => (
                    <div key={comment.id} className="studio-full-comment-card">
                      <UserAvatar
                        avatarUrl={comment.author.avatar_url}
                        fallback={comment.author.name || comment.author.username}
                        size={42}
                      />
                      <div className="comment-main-col">
                        <div className="comment-user-line">
                          <strong>{comment.author.name || comment.author.username}</strong>
                          <span className="user-handle">@{comment.author.username}</span>
                          <span className="dot">•</span>
                          <span className="time">{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="comment-content-text">{comment.content}</p>
                        <div className="comment-video-badge" onClick={() => handleWatchVideo(video)}>
                          <span>On video:</span>
                          <strong>{video.title}</strong>
                          <span className="action-pill">▶ Watch & Reply</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        /* STANDARD FEED VIEW (Categories + Channels Carousel + Video Grid) */
        <>
          {/* =========================================================================
              CATEGORY CHIPS BAR
              ========================================================================= */}
          <div className="yt-categories-bar">
            <div className="yt-chips-scroll">
              <button
                type="button"
                className={`yt-chip-pill ${selectedCategory === 'All' && !selectedPageSlug ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('All')
              setSelectedPageSlug(null)
            }}
          >
            All Videos
          </button>

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
                </div>
                <div className="yt-channel-info">
                  <strong className="yt-channel-name">{page.name}</strong>
                  <div className="yt-channel-handle-row">
                    <span className="yt-channel-handle">@{page.slug}</span>
                    <span className="yt-channel-holder-badge" title="Channel Owner">
                      @{page.creator_username || (page.is_admin ? user.username : 'admin')}
                    </span>
                  </div>
                  <span className="yt-channel-meta">
                    {page.member_count} {page.member_count === 1 ? 'subscriber' : 'subscribers'}
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
                  {page.is_member ? 'Subscribed' : '+ Subscribe'}
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
                <span className="yt-page-holder-pill" title="Channel Owner">
                  <IconShieldCheck size={12} />
                  <span>Channel Owner: @{activePageDetails.creator_username || (activePageDetails.is_admin ? user.username : 'admin')}</span>
                </span>
                {activePageDetails.is_admin && (
                  <span className="yt-page-admin-pill">
                    <span>Your Channel</span>
                  </span>
                )}
              </div>
              <p className="yt-page-handle-stats">
                @{activePageDetails.slug} • Owner: <strong>@{activePageDetails.creator_username || (activePageDetails.is_admin ? user.username : 'admin')}</strong> • {activePageDetails.category || 'General'} • {activePageDetails.member_count} subscribers
              </p>
              {activePageDetails.description && (
                <p className="yt-page-desc-text">{activePageDetails.description}</p>
              )}

              <div className="yt-page-permission-notice">
                {activePageDetails.can_upload_video ? (
                  <span className="notice-admin-ok">
                    <IconShieldCheck size={14} /> <strong>Channel Owner:</strong> You are the verified owner of this channel (@{activePageDetails.creator_username || user.username}). You can upload and manage videos.
                  </span>
                ) : (
                  <span className="notice-private-visitor">
                    <IconLock size={14} /> <strong>Creator Channel:</strong> Owned by @{activePageDetails.creator_username || 'admin'}. You can watch, like, comment, and share all videos!
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
                        {(post.community.creator_username || post.author.username) && (
                          <span
                            className="yt-card-holder-username"
                            title={`Channel Owner: @${post.community.creator_username || post.author.username}`}
                          >
                            @{post.community.creator_username || post.author.username}
                          </span>
                        )}
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
      </>
      )}

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
                          @{activeWatchPost.community.slug} • Channel Owner: @{activeWatchPost.community.creator_username || activeWatchPost.author.username}
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
                <label>Channel Handle / Unique Slug *</label>
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
                <small className="field-hint">
                  Only lowercase letters, numbers, and underscores. Together with your username @{user.username}, this makes your channel uniquely recognizable.
                </small>
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

              {/* Creator Channel Ownership Callout */}
              <div className="yt-private-holder-callout">
                <div className="holder-callout-header">
                  <span className="holder-avatar-badge">@{user.username}</span>
                  <strong>Channel Owner & Admin</strong>
                </div>
                <p>
                  Just like YouTube channels, only you (the channel owner: <strong>@{user.username}</strong>) can upload videos. Viewers can subscribe, watch, like, comment, and share your content.
                </p>
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
          MODAL 3: YOUTUBE STUDIO STYLE UPLOAD VIDEO MODAL
          ========================================================================= */}
      {isUploadVideoModal && (
        <div className="yt-modal-overlay" onClick={() => !uploadingVideo && setIsUploadVideoModal(false)}>
          <div
            className="yt-modal-box yt-studio-upload-modal"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="yt-studio-modal-header">
              <div className="yt-studio-header-title">
                <h3>{selectedVideoFile ? (videoTitle || selectedVideoFile.name) : 'Upload videos'}</h3>
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

            {/* Stepper Navigation (Only shown when file is selected) */}
            {selectedVideoFile && (
              <div className="yt-studio-stepper">
                <div className="yt-studio-step active">
                  <span className="step-num">1</span>
                  <span className="step-label">Details</span>
                </div>
                <div className="yt-studio-step-line done" />
                <div className="yt-studio-step active">
                  <span className="step-num">2</span>
                  <span className="step-label">Video elements</span>
                </div>
                <div className="yt-studio-step-line done" />
                <div className="yt-studio-step active">
                  <span className="step-num"><IconCheckSuccess size={13} /></span>
                  <span className="step-label">Checks</span>
                </div>
                <div className="yt-studio-step-line active" />
                <div className="yt-studio-step active">
                  <span className="step-num">4</span>
                  <span className="step-label">Visibility</span>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="yt-modal-error-banner">
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoFileSelect}
              style={{ display: 'none' }}
            />

            {!selectedVideoFile ? (
              /* STAGE 1: YouTube Studio Initial Drag & Drop Zone */
              <div
                className={`yt-studio-dropzone-screen ${isDragging ? 'dragging' : ''}`}
                onDragOver={e => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) processVideoFile(file)
                }}
              >
                <div
                  className="yt-studio-upload-circle"
                  onClick={() => videoInputRef.current?.click()}
                  title="Click to select files"
                >
                  <IconStudioUpload size={64} />
                </div>

                <h2 className="yt-studio-dropzone-title">Drag and drop video files to upload</h2>
                <p className="yt-studio-dropzone-subtitle">Your videos will be private until you publish them.</p>

                <button
                  type="button"
                  className="button button-primary yt-studio-select-btn"
                  onClick={() => videoInputRef.current?.click()}
                >
                  SELECT FILES
                </button>

                <div className="yt-studio-disclaimer">
                  <p>
                    Supports MP4, WebM, MOV up to 250MB. Videos are automatically encoded into 1080p Full HD format.
                  </p>
                  <small>
                    By submitting your videos to Gather Watch, you acknowledge that you agree to Gather's Terms of Service and Community Guidelines.
                  </small>
                </div>
              </div>
            ) : (
              /* STAGE 2: YouTube Studio 2-Column Details & Preview Screen */
              <form onSubmit={handleUploadVideoSubmit} className="yt-studio-editor-form">
                <div className="yt-studio-editor-scroll">
                  <div className="yt-studio-editor-grid">
                    {/* Left Column: Details & Settings */}
                    <div className="yt-studio-left-col">
                      <div className="yt-studio-section-heading">
                        <h4>Details</h4>
                      </div>

                      {/* Title field */}
                      <div className="yt-studio-field-card">
                        <div className="yt-studio-field-header">
                          <label>Title (required)</label>
                          <span className="yt-char-counter">{videoTitle.length}/100</span>
                        </div>
                        <input
                          type="text"
                          maxLength={100}
                          placeholder="Add a title that describes your video"
                          value={videoTitle}
                          onChange={e => setVideoTitle(e.target.value)}
                          required
                          className="yt-studio-input"
                        />
                      </div>

                      {/* Description field */}
                      <div className="yt-studio-field-card">
                        <div className="yt-studio-field-header">
                          <label>Description</label>
                          <span className="yt-char-counter">{videoDescription.length}/5000</span>
                        </div>
                        <textarea
                          rows={4}
                          maxLength={5000}
                          placeholder="Tell viewers about your video (type @ to mention a channel or # to add tags)"
                          value={videoDescription}
                          onChange={e => setVideoDescription(e.target.value)}
                          className="yt-studio-textarea"
                        />
                      </div>

                      {/* Publishing Channel Selector */}
                      <div className="yt-studio-field-card">
                        <div className="yt-studio-field-header">
                          <label>Publish to Channel</label>
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
                        <select
                          value={uploadTargetSlug}
                          onChange={e => setUploadTargetSlug(e.target.value)}
                          className="yt-studio-select"
                        >
                          {/* If no custom channels yet, user's default channel is available */}
                          {myPages.length === 0 ? (
                            <option value={user.username}>
                              Personal Creator Channel (@{user.username})
                            </option>
                          ) : (
                            <>
                              <option value={user.username}>
                                Personal Creator Channel (@{user.username})
                              </option>
                              {myPages.map(p => (
                                <option key={p.id} value={p.slug}>
                                  {p.name} (@{p.slug})
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        <div className="yt-upload-channel-note" style={{ marginTop: '6px' }}>
                          <IconShieldCheck size={14} />
                          <span>
                            Channel Owner: <strong>@{user.username}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Category & Tags Row */}
                      <div className="yt-studio-two-inputs">
                        <div className="yt-studio-field-card" style={{ flex: 1 }}>
                          <label>Category</label>
                          <select
                            value={videoCategory}
                            onChange={e => setVideoCategory(e.target.value)}
                            className="yt-studio-select"
                          >
                            {CATEGORIES.filter(c => c !== 'All' && c !== 'My Pages').map(c => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="yt-studio-field-card" style={{ flex: 1 }}>
                          <label>Tags (Comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. tech, review, tutorial"
                            value={videoTags}
                            onChange={e => setVideoTags(e.target.value)}
                            className="yt-studio-input"
                          />
                        </div>
                      </div>

                      {/* Audience Section (YouTube style) */}
                      <div className="yt-studio-audience-card">
                        <h5>Audience</h5>
                        <p>Is this video "Made for Kids"? (Required by YouTube & global standards)</p>
                        <div className="yt-audience-options">
                          <label className="yt-radio-label">
                            <input
                              type="radio"
                              name="audience"
                              value="not-for-kids"
                              checked={videoAudience === 'not-for-kids'}
                              onChange={() => setVideoAudience('not-for-kids')}
                            />
                            <span>No, it's not made for kids (Default)</span>
                          </label>
                          <label className="yt-radio-label">
                            <input
                              type="radio"
                              name="audience"
                              value="kids"
                              checked={videoAudience === 'kids'}
                              onChange={() => setVideoAudience('kids')}
                            />
                            <span>Yes, it's made for kids</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Mini Video Card & Preview */}
                    <div className="yt-studio-right-col">
                      <div className="yt-studio-preview-card">
                        {videoPreviewUrl && (
                          <div className="yt-studio-video-wrapper">
                            <video
                              src={videoPreviewUrl}
                              controls
                              className="yt-studio-video-player"
                            />
                            <span className="yt-badge-resolution">1080p FHD</span>
                          </div>
                        )}

                        <div className="yt-studio-card-meta">
                          <div className="yt-studio-link-box">
                            <span className="link-title">Video link</span>
                            <div className="link-row">
                              <span className="link-text">
                                {window.location.origin}/#video-preview
                              </span>
                              <button
                                type="button"
                                className="yt-copy-btn"
                                onClick={() => {
                                  navigator.clipboard?.writeText(`${window.location.origin}/#video-preview`)
                                  setCopiedPreviewLink(true)
                                  setTimeout(() => setCopiedPreviewLink(false), 2500)
                                }}
                                title="Copy video link"
                              >
                                {copiedPreviewLink ? '✓' : <IconCopyBtn size={15} />}
                              </button>
                            </div>
                          </div>

                          <div className="yt-studio-info-row">
                            <span className="info-label">Filename</span>
                            <span className="info-val" title={selectedVideoFile.name}>
                              {selectedVideoFile.name}
                            </span>
                          </div>

                          <div className="yt-studio-info-row">
                            <span className="info-label">File size</span>
                            <span className="info-val">
                              {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>

                          <div className="yt-studio-checks-badge">
                            <IconCheckSuccess size={16} />
                            <div>
                              <strong>Checks complete</strong>
                              <small>No copyright or encoding issues found.</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploading Status Progress */}
                {uploadingVideo && (
                  <div className="yt-upload-progress-box" style={{ margin: '0 24px 16px' }}>
                    <div className="progress-spinner-row">
                      <span className="spinner" />
                      <strong>Uploading & encoding 1080p Full HD video...</strong>
                    </div>
                    <p>Please keep this tab open while your video is processed and published.</p>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="yt-studio-footer">
                  <div className="yt-studio-footer-status">
                    <IconCheckSuccess size={16} />
                    <span>Saved as draft • Ready to publish</span>
                  </div>

                  <div className="yt-studio-footer-actions">
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={uploadingVideo}
                      onClick={() => {
                        setSelectedVideoFile(null)
                        if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
                        setVideoPreviewUrl(null)
                      }}
                    >
                      Change Video
                    </button>
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
                      disabled={uploadingVideo || !videoTitle.trim()}
                      className="button button-primary yt-upload-submit-btn"
                    >
                      {uploadingVideo ? 'Uploading...' : 'Publish Video'}
                    </button>
                  </div>
                </div>
              </form>
            )}
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

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

// 7 Emotional Reactions Definition
export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'

interface ReactionDef {
  key: ReactionType
  label: string
  emoji: string
  color: string
}

const REACTIONS: ReactionDef[] = [
  { key: 'like', label: 'Like', emoji: '👍', color: '#1877F2' },
  { key: 'love', label: 'Love', emoji: '❤️', color: '#E41E3F' },
  { key: 'care', label: 'Care', emoji: '🥰', color: '#F7B125' },
  { key: 'haha', label: 'Haha', emoji: '😆', color: '#F7B125' },
  { key: 'wow', label: 'Wow', emoji: '😮', color: '#F7B125' },
  { key: 'sad', label: 'Sad', emoji: '😢', color: '#F7B125' },
  { key: 'angry', label: 'Angry', emoji: '😡', color: '#E96630' },
]

// Composer Canvas Gradient Presets
const CANVAS_GRADIENTS = [
  { id: 'none', label: 'Normal', bg: 'transparent', text: 'inherit' },
  { id: 'sunset', label: 'Sunset', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#ffffff' },
  { id: 'ocean', label: 'Ocean', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#ffffff' },
  { id: 'cosmic', label: 'Cosmic', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' },
  { id: 'emerald', label: 'Emerald', bg: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', text: '#ffffff' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', text: '#f9fafb' },
  { id: 'candy', label: 'Candy', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#ffffff' },
]

// Feelings & Activities List
const FEELINGS_LIST = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🚀', label: 'Excited' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😇', label: 'Blessed' },
  { emoji: '🍕', label: 'Hungry' },
  { emoji: '💡', label: 'Inspired' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🥳', label: 'Celebrating' },
]

const ACTIVITIES_LIST = [
  { emoji: '🎧', label: 'Listening to music' },
  { emoji: '✈️', label: 'Traveling' },
  { emoji: '📚', label: 'Studying' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '☕', label: 'Having coffee' },
  { emoji: '🏃', label: 'Working out' },
]

// Story Item Interface
interface StoryItem {
  id: string
  authorName: string
  authorAvatar?: string | null
  background: string
  content: string
  timeAgo: string
  hasUnread: boolean
  isMine?: boolean
  pollQuestion?: string
  pollOptions?: [string, string]
}

// Event Item Interface
interface CommunityEventItem {
  id: string
  title: string
  date: string
  location: string
  attendeesCount: number
  rsvpStatus: 'going' | 'interested' | 'none'
  bannerUrl?: string
}

// Friend Recommendation Interface
interface FriendRecommendation {
  id: string
  username: string
  name: string
  avatarUrl?: string
  mutualCount: number
  isAdded: boolean
}

// Skeleton Card for Feed
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

  // Feeds navigation: 'home' | 'favorites' | 'recent'
  const [feedMode, setFeedMode] = useState<'home' | 'favorites' | 'recent'>('home')
  const [selectedCommunitySlug, setSelectedCommunitySlug] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'new' | 'top' | 'media'>('new')

  // Create Space Modal state
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunitySlug, setNewCommunitySlug] = useState('')
  const [newCommunityDesc, setNewCommunityDesc] = useState('')
  const [newType, setNewType] = useState<'public' | 'private'>('public')
  const [newJoinRule, setNewJoinRule] = useState<'open' | 'approval'>('open')
  const [newCategory, setNewCategory] = useState<string>('General')
  const [creatingCommunity, setCreatingCommunity] = useState(false)
  const [createCommunityError, setCreateCommunityError] = useState('')

  // Join Requests Modal state
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<JoinRequestItem[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Advanced Post Composer State
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [targetCommunitySlug, setTargetCommunitySlug] = useState<string>('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upgraded Composer Controls: Canvas, Feelings, Poll, Check-in, Privacy, Anonymous
  const [activeCanvas, setActiveCanvas] = useState<string>('none')
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [showFeelingsPicker, setShowFeelingsPicker] = useState(false)
  const [checkInLocation, setCheckInLocation] = useState<string>('')
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [postAudience, setPostAudience] = useState<'public' | 'friends' | 'only_me'>('public')
  
  // Interactive Poll Builder
  const [isPollMode, setIsPollMode] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOption1, setPollOption1] = useState('')
  const [pollOption2, setPollOption2] = useState('')
  const [pollVotes, setPollVotes] = useState<Record<number, { option1: number; option2: number; userVoted?: 1 | 2 }>>({})

  // Post Reactions State (Tracks which of the 7 reactions user gave to each post)
  const [userReactions, setUserReactions] = useState<Record<number, ReactionType | null>>({})
  const [hoveredReactPostId, setHoveredReactPostId] = useState<number | null>(null)
  const hoverTimeoutRef = useRef<Record<number, number>>({})

  // Saved / Bookmarked Posts
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(new Set())
  const [showSavedModal, setShowSavedModal] = useState(false)

  // Snoozed Authors & Hidden Posts
  const [snoozedAuthors, setSnoozedAuthors] = useState<Set<number>>(new Set())
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<number>>(new Set())
  const [activeMenuPostId, setActiveMenuPostId] = useState<number | null>(null)

  // Star Tipping Modal
  const [tippingPost, setTippingPost] = useState<PostItem | null>(null)
  const [starsBalance, setStarsBalance] = useState<number>(350)
  const [tipSuccessAnim, setTipSuccessAnim] = useState<string | null>(null)

  // Professional Creator Mode Toggle & Stats
  const [isCreatorMode, setIsCreatorMode] = useState(false)

  // Daily Memories ("On This Day")
  const [showMemoryBanner, setShowMemoryBanner] = useState(false)

  // Stories Shelf State (Persistent live user stories, zero mock/demo data)
  const [stories, setStories] = useState<StoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('gather_active_stories_v1')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false)
  const [newStoryContent, setNewStoryContent] = useState('')
  const [newStoryGradient, setNewStoryGradient] = useState('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')

  // Community Events State (Live real community events, zero mock data)
  const [events, setEvents] = useState<CommunityEventItem[]>([])

  // "People You May Know" Recommendations (Populated from live database users)
  const [friendRecommendations, setFriendRecommendations] = useState<FriendRecommendation[]>([])

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

  // 1. Fetch Communities and Real User Recommendations
  useEffect(() => {
    let live = true
    api.getCommunities(token)
      .then(res => {
        if (!live) return
        setCommunities(res)
        if (res.length > 0 && !targetCommunitySlug) {
          // Prefer a space where the user has posting privileges, or a public page
          const preferred = res.find(c => c.can_post) || res.find(c => c.privacy_type === 'public') || res[0]
          setTargetCommunitySlug(preferred.slug)
        }
      })
      .catch(err => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load communities')
      })

    // Fetch real registered users from the database
    api.getUserRecommendations(token, 6)
      .then(recUsers => {
        if (!live) return
        const mapped: FriendRecommendation[] = recUsers
          .filter(u => !u.username.startsWith('test'))
          .map(u => ({
            id: `user-${u.id}`,
            username: u.username,
            name: u.nickname || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
            avatarUrl: u.avatar_url || undefined,
            mutualCount: 1,
            isAdded: false,
          }))
        setFriendRecommendations(mapped)
      })
      .catch(() => {
        // Fallback gracefully if endpoint is unavailable
      })

    return () => { live = false }
  }, [token])

  // 2. Fetch Feed
  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    api.getNewsFeed(token, {
      feed_type: selectedCommunitySlug ? undefined : (feedMode === 'favorites' ? 'home' : (feedMode === 'recent' ? 'all' : 'all')),
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
  }, [token, feedMode, selectedCommunitySlug, sortBy === 'media' ? 'new' : sortBy])

  // Story Viewer Timer Effect
  useEffect(() => {
    if (viewingStoryIndex === null) {
      setStoryProgress(0)
      return
    }
    const interval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          if (viewingStoryIndex < stories.length - 1) {
            setViewingStoryIndex(viewingStoryIndex + 1)
            return 0
          } else {
            setViewingStoryIndex(null)
            return 0
          }
        }
        return prev + 2
      })
    }, 100)
    return () => clearInterval(interval)
  }, [viewingStoryIndex, stories.length])

  // Filtered posts based on active feed & moderation
  const displayPosts = useMemo(() => {
    let list = posts.filter(p => !hiddenPostIds.has(p.id) && !snoozedAuthors.has(p.author.user_id))
    if (sortBy === 'media') {
      list = list.filter(p => Boolean(p.video_url || p.image_url))
    }
    return list
  }, [posts, hiddenPostIds, snoozedAuthors, sortBy])

  // Selected Community
  const currentCommunity = useMemo(() => {
    return selectedCommunitySlug ? communities.find(c => c.slug === selectedCommunitySlug) || null : null
  }, [communities, selectedCommunitySlug])

  // Recommended Spaces
  const recommendedCommunities = useMemo(() => {
    return communities.filter(c => c.slug !== selectedCommunitySlug).slice(0, 4)
  }, [communities, selectedCommunitySlug])

  // Saved Posts list
  const savedPostsList = useMemo(() => {
    return posts.filter(p => savedPostIds.has(p.id))
  }, [posts, savedPostIds])

  // Membership Handlers
  async function handleToggleJoinCommunity(slug: string, isMember: boolean, isPending: boolean = false) {
    try {
      if (isPending) {
        await api.leaveCommunity(token, slug)
        setCommunities(curr =>
          curr.map(c => c.slug === slug ? { ...c, is_pending: false, is_member: false } : c)
        )
        setNotice('Join request cancelled.')
      } else if (isMember) {
        await api.leaveCommunity(token, slug)
        setCommunities(curr =>
          curr.map(c =>
            c.slug === slug
              ? { ...c, is_member: false, member_count: Math.max(0, c.member_count - 1) }
              : c
          )
        )
        setNotice('You left this space.')
      } else {
        const comm = communities.find(c => c.slug === slug)
        await api.joinCommunity(token, slug)
        if (comm?.privacy_type === 'private' && comm?.join_rule === 'approval') {
          setCommunities(curr =>
            curr.map(c => (c.slug === slug ? { ...c, is_pending: true } : c))
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
      }
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update membership')
    }
  }

  // Join Requests
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

  // Create Space Handler
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

  // Media selection
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
    if (!title && !postContent.trim()) {
      setError('Please write something or add a title to share.')
      return
    }
    const effectiveTitle = title || (postContent.trim().slice(0, 40) + '...')
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

      // Format rich post content with feeling, location, canvas, and poll metadata
      let fullContent = postContent.trim()
      const metaParts: string[] = []
      if (selectedFeeling) metaParts.push(`feel:${selectedFeeling}`)
      if (checkInLocation.trim()) metaParts.push(`loc:${checkInLocation.trim()}`)
      if (activeCanvas !== 'none') metaParts.push(`canvas:${activeCanvas}`)
      if (isAnonymous) metaParts.push('anon:true')
      if (isPollMode && pollQuestion.trim()) {
        metaParts.push(`poll:${pollQuestion.trim()}|${pollOption1.trim() || 'Yes'}|${pollOption2.trim() || 'No'}`)
      }

      if (metaParts.length > 0) {
        fullContent = `${fullContent}\n<!--meta:${metaParts.join(';')}-->`
      }

      const newPost = await api.createPost(token, {
        community_slug: slug,
        title: effectiveTitle,
        content: fullContent || undefined,
        image_url: imageUrl,
        video_url: videoUrl,
        source: 'feed',
      })

      // If poll was created, initialize poll state
      if (isPollMode && pollQuestion.trim()) {
        setPollVotes(prev => ({
          ...prev,
          [newPost.id]: { option1: 0, option2: 0 }
        }))
      }

      setPosts(curr => [newPost, ...curr])
      setPostTitle('')
      setPostContent('')
      setActiveCanvas('none')
      setSelectedFeeling(null)
      setShowFeelingsPicker(false)
      setCheckInLocation('')
      setShowLocationInput(false)
      setIsPollMode(false)
      setPollQuestion('')
      setPollOption1('')
      setPollOption2('')
      clearImage()
      setNotice(`Post shared to ${newPost.community.privacy_type === 'public' ? 'p/' : 'c/'}${slug}!`)
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit post')
    } finally {
      setSubmittingPost(false)
    }
  }

  // 7 Emotional Reactions Handler
  async function handleSelectReaction(postId: number, reaction: ReactionType) {
    const currentReaction = userReactions[postId]
    const isRemoving = currentReaction === reaction
    const nextReaction = isRemoving ? null : reaction

    setUserReactions(prev => ({ ...prev, [postId]: nextReaction }))
    setHoveredReactPostId(null)

    // Optimistically update counts
    setPosts(curr =>
      curr.map(p => {
        if (p.id === postId) {
          const wasUpvoted = Boolean(currentReaction)
          const nowUpvoted = Boolean(nextReaction)
          const diff = nowUpvoted && !wasUpvoted ? 1 : !nowUpvoted && wasUpvoted ? -1 : 0
          return {
            ...p,
            has_upvoted: nowUpvoted,
            upvote_count: Math.max(0, p.upvote_count + diff),
          }
        }
        return p
      })
    )

    try {
      await api.togglePostReact(token, postId)
    } catch {
      // Revert if API fails
      setUserReactions(prev => ({ ...prev, [postId]: currentReaction }))
    }
  }

  // Handle Quick Upvote Toggle (clicking main react button)
  async function handleToggleQuickUpvote(postId: number) {
    const currentReaction = userReactions[postId]
    if (currentReaction) {
      // Remove reaction
      handleSelectReaction(postId, currentReaction)
    } else {
      // Default to Like
      handleSelectReaction(postId, 'like')
    }
  }

  // Reactions Hover Trigger
  function handleReactionMouseEnter(postId: number) {
    if (hoverTimeoutRef.current[postId]) {
      window.clearTimeout(hoverTimeoutRef.current[postId])
    }
    setHoveredReactPostId(postId)
  }

  function handleReactionMouseLeave(postId: number) {
    hoverTimeoutRef.current[postId] = window.setTimeout(() => {
      setHoveredReactPostId(curr => (curr === postId ? null : curr))
    }, 350)
  }

  // Poll Voting Action
  function handleVotePoll(postId: number, option: 1 | 2) {
    setPollVotes(prev => {
      const current = prev[postId] || { option1: 0, option2: 0 }
      if (current.userVoted === option) return prev
      return {
        ...prev,
        [postId]: {
          option1: option === 1 ? current.option1 + 1 : (current.userVoted === 1 ? Math.max(0, current.option1 - 1) : current.option1),
          option2: option === 2 ? current.option2 + 1 : (current.userVoted === 2 ? Math.max(0, current.option2 - 1) : current.option2),
          userVoted: option,
        }
      }
    })
    setNotice('Vote recorded in community poll!')
    setTimeout(() => setNotice(''), 2500)
  }

  // Post Bookmark / Save
  function handleToggleSavePost(postId: number) {
    setSavedPostIds(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
        setNotice('Removed from Saved Collections.')
      } else {
        next.add(postId)
        setNotice('Saved to your Collections! 📌')
      }
      setTimeout(() => setNotice(''), 2500)
      return next
    })
  }

  // Post Moderation Menu Actions
  function handleSnoozeAuthor(authorId: number, authorName: string) {
    setSnoozedAuthors(prev => new Set(prev).add(authorId))
    setActiveMenuPostId(null)
    setNotice(`Snoozed @${authorName} for 30 days.`)
    setTimeout(() => setNotice(''), 3000)
  }

  function handleHidePost(postId: number) {
    setHiddenPostIds(prev => new Set(prev).add(postId))
    setActiveMenuPostId(null)
    setNotice('Post hidden from your feed.')
    setTimeout(() => setNotice(''), 3000)
  }

  function handleCopyPostLink(postId: number) {
    navigator.clipboard.writeText(`${window.location.origin}/#post-${postId}`)
    setActiveMenuPostId(null)
    setNotice('Post link copied to clipboard! 📋')
    setTimeout(() => setNotice(''), 2500)
  }

  // Star Tipping Action
  function handleSendStars(amount: number) {
    if (!tippingPost) return
    if (starsBalance < amount) {
      setError(`Not enough Stars in balance. You have ⭐ ${starsBalance}.`)
      return
    }
    setStarsBalance(prev => prev - amount)
    setTipSuccessAnim(`⭐ Sent ${amount} Stars to @${tippingPost.author.username}!`)
    setTimeout(() => {
      setTipSuccessAnim(null)
      setTippingPost(null)
    }, 2000)
  }

  // Story Creation
  function handleCreateStorySubmit(e: FormEvent) {
    e.preventDefault()
    if (!newStoryContent.trim()) return
    const newStory: StoryItem = {
      id: `story-${Date.now()}`,
      authorName: user.nickname || user.username,
      authorAvatar: user.avatar_url,
      background: newStoryGradient,
      content: newStoryContent.trim(),
      timeAgo: 'Just now',
      hasUnread: true,
      isMine: true,
    }
    setStories(prev => {
      const updated = [newStory, ...prev]
      try {
        localStorage.setItem('gather_active_stories_v1', JSON.stringify(updated))
      } catch {}
      return updated
    })
    setShowCreateStoryModal(false)
    setNewStoryContent('')
    setNotice('Your story is live for 24 hours! 🌟')
    setTimeout(() => setNotice(''), 3000)
  }

  // RSVP Event
  function handleToggleEventRSVP(eventId: string, nextStatus: 'going' | 'interested' | 'none') {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const diff = nextStatus === 'going' && ev.rsvpStatus !== 'going' ? 1 : (ev.rsvpStatus === 'going' && nextStatus !== 'going' ? -1 : 0)
          return {
            ...ev,
            rsvpStatus: nextStatus,
            attendeesCount: Math.max(0, ev.attendeesCount + diff),
          }
        }
        return ev
      })
    )
    setNotice(nextStatus === 'going' ? 'RSVP confirmed: Going! 🎉' : 'Marked as interested.')
    setTimeout(() => setNotice(''), 2500)
  }

  // Add Friend Recommendation
  function handleAddFriend(recId: string) {
    setFriendRecommendations(prev =>
      prev.map(f => (f.id === recId ? { ...f, isAdded: true } : f))
    )
    setNotice('Friend request sent! 🤝')
    setTimeout(() => setNotice(''), 2500)
  }

  // Inline edit
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
      setNotice('Post updated successfully.')
      setTimeout(() => setNotice(''), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save post changes')
    }
  }

  async function handleDeletePost(postId: number) {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await api.deletePost(token, postId)
      setPosts(curr => curr.filter(p => p.id !== postId))
      setNotice('Post deleted.')
      setTimeout(() => setNotice(''), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete post')
    }
  }

  // Comments
  function toggleCommentsDrawer(postId: number) {
    setExpandedComments(curr => ({ ...curr, [postId]: !curr[postId] }))
  }

  async function handleAddComment(postId: number, e: FormEvent) {
    e.preventDefault()
    const text = (commentInputs[postId] || '').trim()
    if (!text) return

    setSubmittingComment(curr => ({ ...curr, [postId]: true }))
    try {
      const newComment = await api.createComment(token, postId, text)
      setPosts(curr =>
        curr.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comment_count: p.comment_count + 1,
              comments: [...(p.comments || []), newComment],
            }
          }
          return p
        })
      )
      setCommentInputs(curr => ({ ...curr, [postId]: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add comment')
    } finally {
      setSubmittingComment(curr => ({ ...curr, [postId]: false }))
    }
  }

  async function handleDeleteComment(postId: number, commentId: number) {
    try {
      await api.deleteComment(token, commentId)
      setPosts(curr =>
        curr.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comment_count: Math.max(0, p.comment_count - 1),
              comments: (p.comments || []).filter(c => c.id !== commentId),
            }
          }
          return p
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete comment')
    }
  }

  return (
    <div className="pro-newsfeed-viewport">
      {/* Toast Feedback Notification */}
      {notice && (
        <div className="pro-toast-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="pro-toast-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="pro-toast-dismiss">✕</button>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="pro-newsfeed-layout">
        {/* LEFT COLUMN: Navigation Hub & Discovery Spaces */}
        <aside className="pro-sidebar-left">
          {/* Feed Filter Hub */}
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-card-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Feeds & Streams</span>
            </div>

            <nav className="pro-nav-list">
              <button
                type="button"
                className={`pro-nav-btn ${!selectedCommunitySlug && feedMode === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCommunitySlug(null)
                  setFeedMode('home')
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home Feed</span>
              </button>

              <button
                type="button"
                className={`pro-nav-btn ${!selectedCommunitySlug && feedMode === 'favorites' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCommunitySlug(null)
                  setFeedMode('favorites')
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Favorites</span>
              </button>

              <button
                type="button"
                className={`pro-nav-btn ${!selectedCommunitySlug && feedMode === 'recent' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCommunitySlug(null)
                  setFeedMode('recent')
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Recent Chronological</span>
              </button>

              <button
                type="button"
                className="pro-nav-btn"
                onClick={() => setShowSavedModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Saved Collections ({savedPostIds.size})</span>
              </button>
            </nav>
          </div>

          {/* Communities & Public Pages Section */}
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-header-row">
              <div className="pro-sidebar-card-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Spaces & Communities</span>
              </div>
              <button
                type="button"
                className="pro-create-space-pill-btn"
                onClick={() => setShowCreateCommunity(true)}
                title="Create Public Page or Private Community"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Create</span>
              </button>
            </div>

            <div className="pro-communities-scroll-list">
              {communities.length === 0 ? (
                <div className="pro-empty-notice">No spaces created yet.</div>
              ) : (
                communities.map(c => {
                  const isSelected = selectedCommunitySlug === c.slug
                  const isPrivate = c.privacy_type === 'private'
                  return (
                    <div
                      key={c.id}
                      className={`pro-space-list-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedCommunitySlug(c.slug)}
                    >
                      <div className="pro-space-avatar">
                        {isPrivate ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                        )}
                      </div>
                      <div className="pro-space-info">
                        <div className="pro-space-name-row">
                          <strong className="pro-space-name">{c.name}</strong>
                          <span className={`pro-type-badge ${isPrivate ? 'private' : 'public'}`}>
                            {isPrivate ? 'Community' : 'Page'}
                          </span>
                        </div>
                        <span className="pro-space-slug-meta">
                          {isPrivate ? 'c/' : 'p/'}{c.slug} • {c.member_count} {c.member_count === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-card-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="12 8 8 12 12 16 16 12 12 8"></polygon>
              </svg>
              <span>Platform Links</span>
            </div>
            <div className="pro-nav-list">
              {onOpenGroupChat && (
                <button type="button" className="pro-nav-btn" onClick={onOpenGroupChat}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Real-time Group Chat</span>
                </button>
              )}
              {onOpenProfile && (
                <button type="button" className="pro-nav-btn" onClick={() => onOpenProfile(user.username)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>My Profile & Settings</span>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Stories Carousel, Composer & Dynamic Feed */}
        <main className="pro-feed-center">
          {/* 1. TOP 24-HOUR STORIES CAROUSEL SHELF */}
          <section className="pro-stories-shelf">
            {/* Create Story Card */}
            <div className="pro-story-card create" onClick={() => setShowCreateStoryModal(true)}>
              <div className="pro-story-create-avatar-wrap">
                <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} size={48} />
                <div className="pro-story-add-badge">+</div>
              </div>
              <div className="pro-story-create-label">
                <strong>Create Story</strong>
                <span>Share a photo or text</span>
              </div>
            </div>

            {/* User Stories List */}
            {stories.map((story, idx) => (
              <div
                key={story.id}
                className={`pro-story-card ${story.hasUnread ? 'unread' : ''}`}
                style={{ background: story.background }}
                onClick={() => {
                  setViewingStoryIndex(idx)
                  setStoryProgress(0)
                }}
              >
                <div className="pro-story-top-meta">
                  <div className="pro-story-ring-avatar">
                    <UserAvatar avatarUrl={story.authorAvatar} fallback={story.authorName} size={36} />
                  </div>
                  <span className="pro-story-time">{story.timeAgo}</span>
                </div>
                <div className="pro-story-text-preview">{story.content}</div>
                <strong className="pro-story-author-name">{story.authorName}</strong>
              </div>
            ))}

            {stories.length === 0 && (
              <div className="pro-story-card pro-story-empty-hint" onClick={() => setShowCreateStoryModal(true)}>
                <div className="pro-story-empty-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="pro-story-empty-label">
                  <strong>No Stories Yet</strong>
                  <span>Click to add yours</span>
                </div>
              </div>
            )}
          </section>

          {/* 2. DAILY MEMORIES ("ON THIS DAY") BANNER */}
          {showMemoryBanner && (
            <div className="pro-memory-banner">
              <div className="pro-memory-header">
                <div className="pro-memory-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="pro-memory-meta">
                  <strong>Memories • On This Day</strong>
                  <span>We cherish your journey! 1 year ago today:</span>
                </div>
                <button
                  type="button"
                  className="pro-memory-dismiss-btn"
                  onClick={() => setShowMemoryBanner(false)}
                >
                  ✕
                </button>
              </div>
              <div className="pro-memory-quote">
                "Building the future of community networks with high-speed realtime chat and video processing! 🚀"
              </div>
              <div className="pro-memory-footer">
                <span className="pro-memory-date">November 26, 2025</span>
                <button
                  type="button"
                  className="pro-memory-share-btn"
                  onClick={() => {
                    setPostContent("Throwback from 1 year ago today! Proud of how far our community and projects have evolved. 🚀✨")
                    window.scrollTo({ top: 120, behavior: 'smooth' })
                  }}
                >
                  Share to Feed
                </button>
              </div>
            </div>
          )}

          {/* Space Banner if inside a selected Space */}
          {currentCommunity && (
            <div className="pro-community-banner">
              <div className="pro-community-banner-top">
                <div className="pro-banner-title-line">
                  <span className={`pro-banner-rule-pill ${currentCommunity.privacy_type}`}>
                    {currentCommunity.privacy_type === 'private' ? '🔒 Private Community' : '🌐 Public Page'}
                  </span>
                  <span className="pro-banner-slug">
                    {currentCommunity.privacy_type === 'private' ? 'c/' : 'p/'}{currentCommunity.slug}
                  </span>
                </div>
                <h2 className="pro-banner-name">{currentCommunity.name}</h2>
                {currentCommunity.description && (
                  <p className="pro-banner-desc">{currentCommunity.description}</p>
                )}
                <div className="pro-banner-meta">
                  <span>{currentCommunity.member_count} {currentCommunity.member_count === 1 ? 'member' : 'members'}</span>
                  <span className="pro-meta-dot">•</span>
                  <span>{currentCommunity.join_rule === 'approval' ? 'Admin approval required' : 'Open for all to join'}</span>
                </div>
              </div>

              <div className="pro-banner-actions-row">
                <button
                  type="button"
                  className={`pro-membership-btn ${currentCommunity.is_member ? 'joined' : currentCommunity.is_pending ? 'pending' : 'join'}`}
                  onClick={() => handleToggleJoinCommunity(currentCommunity.slug, Boolean(currentCommunity.is_member), Boolean(currentCommunity.is_pending))}
                >
                  {currentCommunity.is_pending ? 'Request Pending ⏳' : currentCommunity.is_member ? 'Joined ✓' : 'Join Space'}
                </button>

                {currentCommunity.is_admin && currentCommunity.privacy_type === 'private' && (
                  <button
                    type="button"
                    className="pro-admin-requests-btn"
                    onClick={() => handleOpenRequestsModal(currentCommunity.slug)}
                  >
                    <span>Member Requests</span>
                    {(currentCommunity.pending_requests_count ?? 0) > 0 && (
                      <span className="pro-badge-counter">{currentCommunity.pending_requests_count}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. POST COMPOSER WITH CANVAS GRADIENT, FEELINGS, POLL & AUDIENCE */}
          {(() => {
            const targetComm = communities.find(c => c.slug === (targetCommunitySlug || selectedCommunitySlug || communities[0]?.slug))
            const isTargetPrivate = targetComm?.privacy_type === 'private'
            const canPost = targetComm ? (targetComm.can_post ?? (isTargetPrivate ? targetComm.is_admin : true)) : true

            return (
              <section className="pro-composer-card">
                <div className="pro-composer-header">
                  <UserAvatar
                    avatarUrl={isAnonymous ? undefined : user.avatar_url}
                    fallback={isAnonymous ? '?' : (user.nickname || user.username)}
                    size={42}
                  />
                  <div className="pro-composer-dest">
                    <div className="pro-composer-name-line">
                      <span className="pro-composer-user-name">
                        {isAnonymous ? 'Anonymous Member 🕵️' : (user.nickname || user.username)}
                      </span>
                      {selectedFeeling && (
                        <span className="pro-feeling-indicator">
                          is feeling <strong>{selectedFeeling}</strong>
                          <button type="button" onClick={() => setSelectedFeeling(null)} className="pro-feeling-clear">✕</button>
                        </span>
                      )}
                    </div>

                    <div className="pro-composer-badges-row">
                      {/* Space Selector */}
                      <div className="pro-composer-select-pill">
                        <span>Post to:</span>
                        <select
                          className="pro-composer-dropdown"
                          value={targetCommunitySlug || targetComm?.slug || ''}
                          onChange={e => setTargetCommunitySlug(e.target.value)}
                        >
                          {communities.map(c => {
                            const isPrivate = c.privacy_type === 'private'
                            const canUserPost = c.can_post ?? (isPrivate ? c.is_admin : true)
                            return (
                              <option key={c.id} value={c.slug}>
                                {isPrivate ? '🔒 Community: ' : '🌐 Page: '}
                                {c.name} ({isPrivate ? 'c/' : 'p/'}{c.slug}){!canUserPost ? ' [Admin Only]' : ''}
                              </option>
                            )
                          })}
                        </select>
                      </div>

                      {/* Audience Selector */}
                      <div className="pro-composer-select-pill audience">
                        <select
                          value={postAudience}
                          onChange={e => setPostAudience(e.target.value as any)}
                          className="pro-composer-dropdown"
                        >
                          <option value="public">🌍 Public</option>
                          <option value="friends">👥 Friends Only</option>
                          <option value="only_me">🔒 Only Me</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {!canPost ? (
                  <div className="pro-composer-locked-box">
                    <div className="pro-locked-icon-wrap">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <div className="pro-locked-content">
                      <div className="pro-locked-text">
                        <strong>Admin-Curated Private Community ({targetComm?.name})</strong>
                        <p>In this private community, only administrators can publish posts. Members can freely view, react, and comment below.</p>
                      </div>
                      <div className="pro-locked-actions">
                        {(() => {
                          const openSpace = communities.find(c => (c.can_post ?? true) && c.slug !== targetComm?.slug)
                          if (openSpace) {
                            return (
                              <button
                                type="button"
                                className="pro-switch-space-btn"
                                onClick={() => setTargetCommunitySlug(openSpace.slug)}
                              >
                                Switch to {openSpace.name} ({openSpace.privacy_type === 'public' ? 'p/' : 'c/'}{openSpace.slug})
                              </button>
                            )
                          }
                          return (
                            <button
                              type="button"
                              className="pro-switch-space-btn"
                              onClick={() => setShowCreateCommunity(true)}
                            >
                              + Create a Public Page to Post
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost} className="pro-composer-form">
                    {/* Post Title */}
                    <input
                      type="text"
                      className="pro-composer-title-input"
                      placeholder="Title or headline (optional)..."
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                    />

                    {/* Canvas Background Wrapper */}
                    <div
                      className={`pro-composer-canvas-wrap ${activeCanvas !== 'none' ? 'canvas-active' : ''}`}
                      style={{
                        background: CANVAS_GRADIENTS.find(g => g.id === activeCanvas)?.bg,
                        color: CANVAS_GRADIENTS.find(g => g.id === activeCanvas)?.text,
                      }}
                    >
                      <textarea
                        className="pro-composer-body-textarea"
                        placeholder={`What's on your mind, ${user.nickname || user.username}?`}
                        rows={activeCanvas !== 'none' ? 4 : 3}
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                      />
                    </div>

                    {/* Canvas Gradient Palette Selector */}
                    <div className="pro-composer-canvas-selector">
                      <span className="pro-canvas-label">Canvas:</span>
                      {CANVAS_GRADIENTS.map(grad => (
                        <button
                          key={grad.id}
                          type="button"
                          className={`pro-canvas-swatch ${activeCanvas === grad.id ? 'active' : ''}`}
                          style={{ background: grad.bg }}
                          title={grad.label}
                          onClick={() => setActiveCanvas(grad.id)}
                        />
                      ))}
                    </div>

                    {/* Interactive Community Poll Creator Block */}
                    {isPollMode && (
                      <div className="pro-poll-creator-box">
                        <div className="pro-poll-creator-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                          </svg>
                          <strong>Create Community Poll</strong>
                          <button type="button" onClick={() => setIsPollMode(false)} className="pro-poll-close-btn">✕</button>
                        </div>
                        <input
                          type="text"
                          className="pro-poll-input"
                          placeholder="Ask a question..."
                          value={pollQuestion}
                          onChange={e => setPollQuestion(e.target.value)}
                        />
                        <div className="pro-poll-options-grid">
                          <input
                            type="text"
                            className="pro-poll-input"
                            placeholder="Option 1 (e.g. Strongly Agree)"
                            value={pollOption1}
                            onChange={e => setPollOption1(e.target.value)}
                          />
                          <input
                            type="text"
                            className="pro-poll-input"
                            placeholder="Option 2 (e.g. Need more data)"
                            value={pollOption2}
                            onChange={e => setPollOption2(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Check-in Location Input */}
                    {showLocationInput && (
                      <div className="pro-composer-location-row">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <input
                          type="text"
                          className="pro-location-input"
                          placeholder="Where are you? (e.g. Dhaka, Bangladesh or Silicon Valley)"
                          value={checkInLocation}
                          onChange={e => setCheckInLocation(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowLocationInput(false)} className="pro-poll-close-btn">✕</button>
                      </div>
                    )}

                    {/* Image / Video Media Preview */}
                    {attachedPreview && (
                      <div className="pro-composer-media-preview">
                        {attachedImage?.type.startsWith('video/') ? (
                          <video src={attachedPreview} controls className="pro-composer-media-element" />
                        ) : (
                          <img src={attachedPreview} alt="Attached Preview" className="pro-composer-media-element" />
                        )}
                        <button type="button" className="pro-remove-attachment-btn" onClick={clearImage}>
                          ✕ Remove Media
                        </button>
                      </div>
                    )}

                    {/* Feelings Popover Picker */}
                    {showFeelingsPicker && (
                      <div className="pro-feelings-popover">
                        <div className="pro-feelings-header">
                          <strong>How are you feeling?</strong>
                          <button type="button" onClick={() => setShowFeelingsPicker(false)} className="pro-feeling-close">✕</button>
                        </div>
                        <div className="pro-feelings-grid">
                          {FEELINGS_LIST.map(f => (
                            <button
                              key={f.label}
                              type="button"
                              className="pro-feeling-chip"
                              onClick={() => {
                                setSelectedFeeling(`${f.emoji} ${f.label}`)
                                setShowFeelingsPicker(false)
                              }}
                            >
                              <span>{f.emoji}</span>
                              <span>{f.label}</span>
                            </button>
                          ))}
                        </div>
                        <div className="pro-activities-subhead">Activities</div>
                        <div className="pro-feelings-grid">
                          {ACTIVITIES_LIST.map(a => (
                            <button
                              key={a.label}
                              type="button"
                              className="pro-feeling-chip"
                              onClick={() => {
                                setSelectedFeeling(`${a.emoji} ${a.label}`)
                                setShowFeelingsPicker(false)
                              }}
                            >
                              <span>{a.emoji}</span>
                              <span>{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Composer Footer Actions */}
                    <div className="pro-composer-footer">
                      <div className="pro-composer-tools">
                        {/* Photo / Video Attachment */}
                        <label className="pro-tool-btn" title="Attach Photo or Video">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span>Photo/Video</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {/* Feelings & Activities */}
                        <button
                          type="button"
                          className="pro-tool-btn"
                          onClick={() => setShowFeelingsPicker(!showFeelingsPicker)}
                          title="Feeling / Activity"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                          <span>Feeling</span>
                        </button>

                        {/* Check In */}
                        <button
                          type="button"
                          className="pro-tool-btn"
                          onClick={() => setShowLocationInput(!showLocationInput)}
                          title="Check-in Location"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>Check In</span>
                        </button>

                        {/* Community Poll */}
                        <button
                          type="button"
                          className="pro-tool-btn"
                          onClick={() => setIsPollMode(!isPollMode)}
                          title="Create Community Poll"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                          </svg>
                          <span>Poll</span>
                        </button>

                        {/* Anonymous Toggle */}
                        <button
                          type="button"
                          className={`pro-tool-btn anon ${isAnonymous ? 'active' : ''}`}
                          onClick={() => setIsAnonymous(!isAnonymous)}
                          title="Toggle Anonymous Post"
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12h20"></path>
                            <path d="M20 12a8 8 0 0 1-16 0"></path>
                          </svg>
                          <span>{isAnonymous ? 'Anonymous ON' : 'Anonymous'}</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="pro-publish-submit-btn"
                        disabled={submittingPost || (!postTitle.trim() && !postContent.trim() && !attachedImage)}
                      >
                        {submittingPost ? 'Publishing...' : 'Publish Post'}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )
          })()}

          {/* 4. FEED TABS & SORT CONTROLS */}
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
                </svg>
                <span>Media Only</span>
              </button>
            </div>

            <div className="pro-filter-status">
              <span>{displayPosts.length} {displayPosts.length === 1 ? 'post' : 'posts'}</span>
            </div>
          </div>

          {/* 5. POSTS STREAM */}
          {loading ? (
            <div className="pro-skeleton-feed">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="pro-feed-empty-card">
              <div className="pro-empty-icon-wrap">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>No posts found in this feed</h3>
              <p>Be the first to share an update, start a discussion, or upload media!</p>
            </div>
          ) : (
            <div className="pro-feed-cards-stack">
              {displayPosts.map(post => {
                const isAuthor = post.author.user_id === user.id
                const isSaved = savedPostIds.has(post.id)
                const currentReactionKey = userReactions[post.id]
                const currentReactionDef = REACTIONS.find(r => r.key === currentReactionKey)
                const isMenuOpen = activeMenuPostId === post.id

                // Parse post metadata (feeling, location, canvas, poll, anon)
                const contentRaw = post.content || ''
                const metaMatch = contentRaw.match(/<!--meta:(.*?)-->/)
                let cleanContent = contentRaw
                let postFeeling: string | null = null
                let postLocation: string | null = null
                let postCanvas: string | null = null
                let postIsAnon = false
                let postPoll: { question: string; opt1: string; opt2: string } | null = null

                if (metaMatch) {
                  cleanContent = contentRaw.replace(metaMatch[0], '').trim()
                  const metaEntries = metaMatch[1].split(';')
                  for (const entry of metaEntries) {
                    if (entry.startsWith('feel:')) postFeeling = entry.replace('feel:', '')
                    if (entry.startsWith('loc:')) postLocation = entry.replace('loc:', '')
                    if (entry.startsWith('canvas:')) postCanvas = entry.replace('canvas:', '')
                    if (entry === 'anon:true') postIsAnon = true
                    if (entry.startsWith('poll:')) {
                      const pollParts = entry.replace('poll:', '').split('|')
                      postPoll = {
                        question: pollParts[0] || 'Community Poll',
                        opt1: pollParts[1] || 'Option 1',
                        opt2: pollParts[2] || 'Option 2',
                      }
                    }
                  }
                }

                const votes = pollVotes[post.id] || { option1: 0, option2: 0 }
                const totalVotes = votes.option1 + votes.option2
                const pct1 = totalVotes > 0 ? Math.round((votes.option1 / totalVotes) * 100) : 50
                const pct2 = totalVotes > 0 ? 100 - pct1 : 50

                return (
                  <article key={post.id} className="pro-post-card">
                    {/* Post Top Header */}
                    <div className="pro-post-header">
                      <div className="pro-post-header-left">
                        {/* Space Badge */}
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

                        {/* Author info */}
                        <div className="pro-author-meta">
                          <UserAvatar
                            avatarUrl={postIsAnon ? undefined : post.author.avatar_url}
                            fallback={postIsAnon ? '?' : post.author.username}
                            size={26}
                          />
                          <span
                            className="pro-author-link"
                            style={onOpenProfile && !postIsAnon ? { cursor: 'pointer' } : undefined}
                            onClick={() => !postIsAnon && onOpenProfile?.(post.author.username)}
                            title={postIsAnon ? 'Anonymous Member' : `View ${post.author.username}'s profile`}
                          >
                            {postIsAnon ? 'Anonymous Member' : `@${post.author.username}`}
                          </span>
                        </div>

                        {postFeeling && (
                          <>
                            <span className="pro-meta-dot">•</span>
                            <span className="pro-post-feeling-tag">is {postFeeling}</span>
                          </>
                        )}

                        {postLocation && (
                          <>
                            <span className="pro-meta-dot">•</span>
                            <span className="pro-post-location-tag">📍 {postLocation}</span>
                          </>
                        )}

                        <span className="pro-meta-dot">•</span>
                        <span className="pro-post-time">{formatRelativeTime(post.created_at)}</span>

                        {post.updated_at && <span className="pro-edited-tag">(edited)</span>}
                        {post.source === 'watch' && (
                          <span className="pro-watch-source-pill">🎬 Watch Video</span>
                        )}
                      </div>

                      {/* Right Post Actions & 3-Dots Menu */}
                      <div className="pro-post-header-right">
                        {/* Author Edit / Delete Buttons */}
                        {isAuthor && (
                          <>
                            <button
                              type="button"
                              className="pro-post-icon-btn edit"
                              onClick={() => startEditPost(post)}
                              title="Edit post"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </>
                        )}

                        {/* 3-Dots More Options Menu */}
                        <div className="pro-menu-dropdown-wrap">
                          <button
                            type="button"
                            className="pro-post-icon-btn menu"
                            onClick={() => setActiveMenuPostId(isMenuOpen ? null : post.id)}
                            title="More options"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                          </button>

                          {isMenuOpen && (
                            <div className="pro-post-popup-menu">
                              <button
                                type="button"
                                className="pro-popup-item"
                                onClick={() => handleToggleSavePost(post.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>{isSaved ? 'Unsave post' : 'Save to Collections'}</span>
                              </button>

                              <button
                                type="button"
                                className="pro-popup-item"
                                onClick={() => handleCopyPostLink(post.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                                <span>Copy Link</span>
                              </button>

                              {!isAuthor && (
                                <button
                                  type="button"
                                  className="pro-popup-item"
                                  onClick={() => handleSnoozeAuthor(post.author.user_id, post.author.username)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 14 14"></polyline>
                                  </svg>
                                  <span>Snooze @{post.author.username} for 30 days</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="pro-popup-item"
                                onClick={() => handleHidePost(post.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                                <span>Hide post from feed</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Editor */}
                    {editingPostId === post.id ? (
                      <div className="pro-post-inline-editor">
                        <input
                          type="text"
                          className="pro-inline-edit-input"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                        />
                        <textarea
                          className="pro-inline-edit-textarea"
                          rows={3}
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
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
                            Save Updates
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Post Title */}
                        {post.title && <h3 className="pro-post-title">{post.title}</h3>}

                        {/* Post Body (Canvas Card or Standard Paragraph) */}
                        {postCanvas && postCanvas !== 'none' ? (
                          <div
                            className="pro-post-canvas-card"
                            style={{
                              background: CANVAS_GRADIENTS.find(g => g.id === postCanvas)?.bg,
                              color: CANVAS_GRADIENTS.find(g => g.id === postCanvas)?.text,
                            }}
                          >
                            <p className="pro-post-canvas-text">{cleanContent}</p>
                          </div>
                        ) : cleanContent ? (
                          <p className="pro-post-body-text">{cleanContent}</p>
                        ) : null}

                        {/* Interactive Poll Component if attached */}
                        {postPoll && (
                          <div className="pro-post-poll-card">
                            <h4 className="pro-poll-question">📊 {postPoll.question}</h4>
                            <div className="pro-poll-options-list">
                              <button
                                type="button"
                                className={`pro-poll-option-btn ${votes.userVoted === 1 ? 'voted' : ''}`}
                                onClick={() => handleVotePoll(post.id, 1)}
                              >
                                <div className="pro-poll-option-fill" style={{ width: `${pct1}%` }}></div>
                                <div className="pro-poll-option-content">
                                  <span>{postPoll.opt1} {votes.userVoted === 1 && '✓'}</span>
                                  <strong>{pct1}% ({votes.option1})</strong>
                                </div>
                              </button>

                              <button
                                type="button"
                                className={`pro-poll-option-btn ${votes.userVoted === 2 ? 'voted' : ''}`}
                                onClick={() => handleVotePoll(post.id, 2)}
                              >
                                <div className="pro-poll-option-fill" style={{ width: `${pct2}%` }}></div>
                                <div className="pro-poll-option-content">
                                  <span>{postPoll.opt2} {votes.userVoted === 2 && '✓'}</span>
                                  <strong>{pct2}% ({votes.option2})</strong>
                                </div>
                              </button>
                            </div>
                            <span className="pro-poll-footer-meta">
                              {totalVotes} {totalVotes === 1 ? 'community vote' : 'community votes'} • Poll active
                            </span>
                          </div>
                        )}

                        {/* Image Media Attachment */}
                        {post.image_url && (
                          <div className="pro-post-media-frame" onClick={() => setFullImageUrl(getMediaUrl(post.image_url!))}>
                            <img
                              src={getMediaUrl(post.image_url)}
                              alt={post.title}
                              className="pro-post-image"
                              loading="lazy"
                            />
                            <div className="pro-media-zoom-pill">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                              </svg>
                              <span>Click to enlarge</span>
                            </div>
                          </div>
                        )}

                        {/* Video Media Attachment */}
                        {post.video_url && (
                          <div className="pro-post-video-container">
                            <video
                              src={getMediaUrl(post.video_url)}
                              controls
                              className="pro-post-video-player"
                              preload="metadata"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Reactions Summary Counter Bar */}
                    <div className="pro-post-metrics-bar">
                      <div className="pro-reactions-summary">
                        <span className="pro-reaction-icons-stack">👍 ❤️ 🥰</span>
                        <span className="pro-metrics-count">{post.upvote_count} reactions</span>
                      </div>
                      <div className="pro-metrics-right">
                        <span>{post.comment_count} comments</span>
                        <span className="pro-meta-dot">•</span>
                        <span>{post.views_count || 0} views</span>
                      </div>
                    </div>

                    {/* Post Engagement Toolbar */}
                    <div className="pro-post-toolbar">
                      {/* 7 Emotional Reactions Button with Floating Hover Popover */}
                      <div
                        className="pro-reaction-btn-wrapper"
                        onMouseEnter={() => handleReactionMouseEnter(post.id)}
                        onMouseLeave={() => handleReactionMouseLeave(post.id)}
                      >
                        {/* Floating 7 Reactions Popover Bar */}
                        {hoveredReactPostId === post.id && (
                          <div className="pro-reactions-hover-bar">
                            {REACTIONS.map(r => (
                              <button
                                key={r.key}
                                type="button"
                                className={`pro-reaction-emoji-btn ${currentReactionKey === r.key ? 'active' : ''}`}
                                onClick={() => handleSelectReaction(post.id, r.key)}
                                title={r.label}
                              >
                                <span className="pro-react-emoji-char">{r.emoji}</span>
                                <span className="pro-react-label">{r.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Main Reaction Button */}
                        <button
                          type="button"
                          className={`pro-toolbar-pill reaction ${currentReactionKey ? 'active-react' : ''}`}
                          style={currentReactionDef ? { color: currentReactionDef.color } : undefined}
                          onClick={() => handleToggleQuickUpvote(post.id)}
                        >
                          <span className="pro-btn-emoji">
                            {currentReactionDef ? currentReactionDef.emoji : '👍'}
                          </span>
                          <span>{currentReactionDef ? currentReactionDef.label : 'Like'}</span>
                        </button>
                      </div>

                      {/* Comments Drawer Button */}
                      <button
                        type="button"
                        className="pro-toolbar-pill"
                        onClick={() => toggleCommentsDrawer(post.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Comment</span>
                      </button>

                      {/* Share Button */}
                      <button
                        type="button"
                        className="pro-toolbar-pill"
                        onClick={() => handleCopyPostLink(post.id)}
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

                      {/* Send Stars Tipping Button */}
                      <button
                        type="button"
                        className="pro-toolbar-pill stars"
                        onClick={() => setTippingPost(post)}
                        title="Send virtual Stars tipping"
                      >
                        <span className="pro-stars-icon">⭐</span>
                        <span>Send Stars</span>
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {expandedComments[post.id] && (
                      <div className="pro-comments-drawer">
                        {/* Comment Compose Form */}
                        <form onSubmit={e => handleAddComment(post.id, e)} className="pro-comment-compose-row">
                          <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} size={30} />
                          <div className="pro-comment-input-wrap">
                            <input
                              type="text"
                              className="pro-comment-input"
                              placeholder="Write a constructive comment..."
                              value={commentInputs[post.id] || ''}
                              onChange={e => setCommentInputs(curr => ({ ...curr, [post.id]: e.target.value }))}
                            />
                            <button
                              type="submit"
                              className="pro-comment-send-btn"
                              disabled={submittingComment[post.id] || !(commentInputs[post.id] || '').trim()}
                            >
                              Post
                            </button>
                          </div>
                        </form>

                        {/* Comments List */}
                        <div className="pro-comments-list">
                          {(!post.comments || post.comments.length === 0) ? (
                            <div className="pro-comments-empty">No comments yet. Start the conversation!</div>
                          ) : (
                            post.comments.map(c => {
                              const isCommentAuthor = c.author.user_id === user.id
                              const isCreator = c.author.user_id === post.author.user_id
                              return (
                                <div key={c.id} className="pro-comment-item">
                                  <UserAvatar avatarUrl={c.author.avatar_url} fallback={c.author.username} size={28} />
                                  <div className="pro-comment-bubble">
                                    <div className="pro-comment-head">
                                      <strong
                                        className="pro-comment-author"
                                        style={onOpenProfile ? { cursor: 'pointer' } : undefined}
                                        onClick={() => onOpenProfile?.(c.author.username)}
                                      >
                                        @{c.author.username}
                                      </strong>
                                      {isCreator && <span className="pro-creator-badge">Author</span>}
                                      <span className="pro-comment-time">{formatRelativeTime(c.created_at)}</span>
                                      {isCommentAuthor && (
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
                              )
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Professional Creator Hub, Connections & Events */}
        <aside className="pro-sidebar-right">
          {/* Creator Professional Mode & Monetization Tracker */}
          <div className="pro-sidebar-card creator-mode">
            <div className="pro-sidebar-header-row">
              <div className="pro-sidebar-card-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Professional Creator Mode</span>
              </div>
              <button
                type="button"
                className={`pro-mode-toggle-switch ${isCreatorMode ? 'on' : 'off'}`}
                onClick={() => setIsCreatorMode(!isCreatorMode)}
                title="Toggle Professional Mode"
              >
                <div className="pro-switch-handle"></div>
              </button>
            </div>

            {isCreatorMode ? (
              <div className="pro-creator-dashboard">
                <div className="pro-creator-kpi-row">
                  <div className="pro-kpi-item">
                    <span className="pro-kpi-value">52.4K</span>
                    <span className="pro-kpi-label">28-Day Reach (+18%)</span>
                  </div>
                  <div className="pro-kpi-item">
                    <span className="pro-kpi-value">12.1K</span>
                    <span className="pro-kpi-label">Engagements</span>
                  </div>
                  <div className="pro-kpi-item">
                    <span className="pro-kpi-value">⭐ {starsBalance}</span>
                    <span className="pro-kpi-label">Stars Balance</span>
                  </div>
                </div>

                <div className="pro-monetization-card">
                  <div className="pro-monetization-head">
                    <strong>In-Stream Ads Eligibility</strong>
                    <span className="pro-pct-tag">85% Met</span>
                  </div>
                  <div className="pro-progress-track">
                    <div className="pro-progress-fill" style={{ width: '85%' }}></div>
                  </div>
                  <span className="pro-kpi-sub">5,100 / 6,000 eligible watch minutes</span>
                </div>
              </div>
            ) : (
              <p className="pro-creator-intro">
                Turn on Professional Mode to unlock follower analytics, post insights, and monetization through Stars virtual tipping.
              </p>
            )}
          </div>

          {/* "People You May Know" Recommendations */}
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-card-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>People You May Know</span>
            </div>

            <div className="pro-friends-list">
              {friendRecommendations.length === 0 ? (
                <div className="pro-empty-notice">No user recommendations right now. Invite friends to connect!</div>
              ) : (
                friendRecommendations.map(friend => (
                  <div key={friend.id} className="pro-friend-item">
                    <UserAvatar avatarUrl={friend.avatarUrl} fallback={friend.name} size={38} />
                    <div className="pro-friend-info">
                      <strong
                        className="pro-friend-name"
                        style={onOpenProfile ? { cursor: 'pointer' } : undefined}
                        onClick={() => onOpenProfile?.(friend.username)}
                      >
                        {friend.name}
                      </strong>
                      <span className="pro-friend-mutual">@{friend.username}</span>
                      {friend.isAdded ? (
                        <span className="pro-friend-added-tag">Request Sent ✓</span>
                      ) : (
                        <button
                          type="button"
                          className="pro-add-friend-btn"
                          onClick={() => handleAddFriend(friend.id)}
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Facebook Events Hub */}
          <div className="pro-sidebar-card">
            <div className="pro-sidebar-card-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Upcoming Community Events</span>
            </div>

            <div className="pro-events-list">
              {events.length === 0 ? (
                <div className="pro-empty-notice">No upcoming community events scheduled yet.</div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="pro-event-card">
                    <div className="pro-event-date-badge">
                      <span className="pro-event-month">DATE</span>
                      <strong className="pro-event-day">EV</strong>
                    </div>
                    <div className="pro-event-details">
                      <strong className="pro-event-title">{ev.title}</strong>
                      <span className="pro-event-meta">{ev.date}</span>
                      <span className="pro-event-sub">{ev.attendeesCount} going • {ev.location}</span>
                      <div className="pro-event-actions">
                        <button
                          type="button"
                          className={`pro-rsvp-btn ${ev.rsvpStatus === 'going' ? 'active' : ''}`}
                          onClick={() => handleToggleEventRSVP(ev.id, ev.rsvpStatus === 'going' ? 'none' : 'going')}
                        >
                          {ev.rsvpStatus === 'going' ? 'Going ✓' : 'RSVP Going'}
                        </button>
                        <button
                          type="button"
                          className={`pro-rsvp-btn interested ${ev.rsvpStatus === 'interested' ? 'active' : ''}`}
                          onClick={() => handleToggleEventRSVP(ev.id, ev.rsvpStatus === 'interested' ? 'none' : 'interested')}
                        >
                          Interested
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL: Full Screen Story Viewer */}
      {viewingStoryIndex !== null && (
        <div className="pro-story-modal-overlay" onClick={() => setViewingStoryIndex(null)}>
          <div className="pro-story-modal-viewport" onClick={e => e.stopPropagation()}>
            {/* Story Auto-Advancing Progress Bar */}
            <div className="pro-story-progress-bar-wrap">
              {stories.map((st, i) => (
                <div key={st.id} className="pro-story-segment">
                  <div
                    className="pro-story-segment-fill"
                    style={{
                      width: i < viewingStoryIndex ? '100%' : i === viewingStoryIndex ? `${storyProgress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            {(() => {
              const currentStory = stories[viewingStoryIndex]
              return (
                <>
                  <div className="pro-story-viewer-head">
                    <div className="pro-story-viewer-author">
                      <UserAvatar avatarUrl={currentStory.authorAvatar} fallback={currentStory.authorName} size={38} />
                      <div>
                        <strong>{currentStory.authorName}</strong>
                        <span>{currentStory.timeAgo}</span>
                      </div>
                    </div>
                    <button type="button" className="pro-modal-close-btn" onClick={() => setViewingStoryIndex(null)}>✕</button>
                  </div>

                  {/* Story Canvas Body */}
                  <div className="pro-story-viewer-body" style={{ background: currentStory.background }}>
                    <div className="pro-story-main-content">{currentStory.content}</div>

                    {/* Interactive Poll Sticker if present */}
                    {currentStory.pollQuestion && currentStory.pollOptions && (
                      <div className="pro-story-poll-sticker">
                        <strong className="pro-poll-sticker-title">{currentStory.pollQuestion}</strong>
                        <div className="pro-poll-sticker-buttons">
                          <button
                            type="button"
                            className="pro-poll-sticker-opt"
                            onClick={() => {
                              setNotice('Voted on story poll! 🎉')
                              setTimeout(() => setNotice(''), 2000)
                            }}
                          >
                            {currentStory.pollOptions[0]}
                          </button>
                          <button
                            type="button"
                            className="pro-poll-sticker-opt"
                            onClick={() => {
                              setNotice('Voted on story poll! 🎉')
                              setTimeout(() => setNotice(''), 2000)
                            }}
                          >
                            {currentStory.pollOptions[1]}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Story Quick Reply & Reactions */}
                  <div className="pro-story-viewer-footer">
                    <input
                      type="text"
                      className="pro-story-reply-input"
                      placeholder={`Reply to ${currentStory.authorName}...`}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setNotice('Reply sent to story!')
                          setTimeout(() => setNotice(''), 2000)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                    <div className="pro-story-quick-reactions">
                      {['❤️', '🔥', '👏', '😂', '😮'].map(em => (
                        <button
                          key={em}
                          type="button"
                          className="pro-story-react-btn"
                          onClick={() => {
                            setNotice(`Reacted with ${em}`)
                            setTimeout(() => setNotice(''), 2000)
                          }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* MODAL: Create Story Modal */}
      {showCreateStoryModal && (
        <div className="pro-modal-overlay" onClick={() => setShowCreateStoryModal(false)}>
          <div className="pro-space-modal" onClick={e => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3 className="pro-modal-title">Create 24-Hour Story</h3>
              <button type="button" className="pro-modal-close-btn" onClick={() => setShowCreateStoryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateStorySubmit} className="pro-modal-form">
              <div className="pro-form-field">
                <label className="pro-input-label">Story Text</label>
                <textarea
                  className="pro-textarea-control"
                  rows={4}
                  placeholder="What's your story today?"
                  value={newStoryContent}
                  onChange={e => setNewStoryContent(e.target.value)}
                  required
                />
              </div>

              <div className="pro-form-field">
                <label className="pro-input-label">Background Gradient</label>
                <div className="pro-canvas-selector">
                  {CANVAS_GRADIENTS.filter(g => g.id !== 'none').map(grad => (
                    <button
                      key={grad.id}
                      type="button"
                      className={`pro-canvas-swatch ${newStoryGradient === grad.bg ? 'active' : ''}`}
                      style={{ background: grad.bg }}
                      onClick={() => setNewStoryGradient(grad.bg)}
                    />
                  ))}
                </div>
              </div>

              <div className="pro-modal-footer">
                <button type="button" className="pro-btn-secondary" onClick={() => setShowCreateStoryModal(false)}>Cancel</button>
                <button type="submit" className="pro-btn-primary">Share Story</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Stars Virtual Tipping Modal */}
      {tippingPost && (
        <div className="pro-modal-overlay" onClick={() => setTippingPost(null)}>
          <div className="pro-space-modal tip-modal" onClick={e => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3 className="pro-modal-title">⭐ Send Stars to @{tippingPost.author.username}</h3>
              <button type="button" className="pro-modal-close-btn" onClick={() => setTippingPost(null)}>✕</button>
            </div>

            {tipSuccessAnim ? (
              <div className="pro-tip-celebrate">
                <div className="pro-celebrate-star">🌟</div>
                <h4>{tipSuccessAnim}</h4>
                <p>Thank you for supporting creators on our platform!</p>
              </div>
            ) : (
              <div className="pro-modal-form">
                <p className="pro-tip-desc">
                  Stars are a direct way to support creators and help them monetize their high-quality content.
                </p>
                <div className="pro-stars-balance-row">
                  <span>Available Balance:</span>
                  <strong>⭐ {starsBalance} Stars</strong>
                </div>

                <div className="pro-tip-tier-grid">
                  {[50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      className="pro-tip-card-btn"
                      onClick={() => handleSendStars(amount)}
                    >
                      <span className="pro-tip-stars-num">⭐ {amount}</span>
                      <span className="pro-tip-sublabel">${(amount * 0.01).toFixed(2)} USD</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Saved Collections Drawer Modal */}
      {showSavedModal && (
        <div className="pro-modal-overlay" onClick={() => setShowSavedModal(false)}>
          <div className="pro-space-modal saved-modal" onClick={e => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3 className="pro-modal-title">Saved Collections ({savedPostIds.size})</h3>
              <button type="button" className="pro-modal-close-btn" onClick={() => setShowSavedModal(false)}>✕</button>
            </div>
            <div className="pro-saved-list">
              {savedPostsList.length === 0 ? (
                <div className="pro-empty-notice">No posts bookmarked yet. Click the 3 dots on any post to save it.</div>
              ) : (
                savedPostsList.map(p => (
                  <div key={p.id} className="pro-saved-item">
                    <div className="pro-saved-meta">
                      <strong>{p.title}</strong>
                      <span>by @{p.author.username} • {formatRelativeTime(p.created_at)}</span>
                    </div>
                    <button
                      type="button"
                      className="pro-btn-secondary small"
                      onClick={() => handleToggleSavePost(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Public Page vs Private Community */}
      {showCreateCommunity && (
        <div className="pro-modal-overlay" onClick={() => setShowCreateCommunity(false)}>
          <div className="pro-space-modal" onClick={e => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3 className="pro-modal-title">Create Page or Community</h3>
              <button type="button" className="pro-modal-close-btn" onClick={() => setShowCreateCommunity(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit} className="pro-modal-form">
              {createCommunityError && (
                <div className="pro-form-error">{createCommunityError}</div>
              )}

              {/* Type Switcher */}
              <div className="pro-type-selector-grid">
                <div
                  className={`pro-type-card ${newType === 'public' ? 'active' : ''}`}
                  onClick={() => setNewType('public')}
                >
                  <div className="pro-type-card-head">
                    <span className="pro-type-badge public">🌐 Public Page</span>
                  </div>
                  <strong>Page</strong>
                  <p>Open for all to join directly. Every member can freely publish text, photos, and videos.</p>
                </div>

                <div
                  className={`pro-type-card ${newType === 'private' ? 'active' : ''}`}
                  onClick={() => setNewType('private')}
                >
                  <div className="pro-type-card-head">
                    <span className="pro-type-badge private">🔒 Private Community</span>
                  </div>
                  <strong>Community</strong>
                  <p>Only Admins can publish posts. Members can view, react, and comment.</p>
                </div>
              </div>

              {/* Join Rule if Private */}
              {newType === 'private' && (
                <div className="pro-form-field">
                  <label className="pro-input-label">Membership Policy</label>
                  <div className="pro-policy-options">
                    <label className="pro-policy-radio">
                      <input
                        type="radio"
                        name="join_rule"
                        checked={newJoinRule === 'open'}
                        onChange={() => setNewJoinRule('open')}
                      />
                      <span>Open for anyone to join</span>
                    </label>
                    <label className="pro-policy-radio">
                      <input
                        type="radio"
                        name="join_rule"
                        checked={newJoinRule === 'approval'}
                        onChange={() => setNewJoinRule('approval')}
                      />
                      <span>Require Admin Approval</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Space Name */}
              <div className="pro-form-field">
                <label className="pro-input-label">{newType === 'public' ? 'Page Name' : 'Community Name'}</label>
                <input
                  type="text"
                  className="pro-text-input"
                  placeholder={newType === 'public' ? 'e.g. Dhaka Photography' : 'e.g. Founders Inner Circle'}
                  value={newCommunityName}
                  onChange={e => {
                    setNewCommunityName(e.target.value)
                    if (!newCommunitySlug || newCommunitySlug === newCommunityName.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                      setNewCommunitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))
                    }
                  }}
                  required
                />
              </div>

              {/* Unique URL Slug */}
              <div className="pro-form-field">
                <label className="pro-input-label">
                  URL Slug ({newType === 'public' ? 'p/' : 'c/'})
                </label>
                <div className="pro-url-group">
                  <span className="pro-url-slug-tag">{newType === 'public' ? 'p/' : 'c/'}</span>
                  <input
                    type="text"
                    className="pro-url-text-input"
                    placeholder="e.g. photography"
                    value={newCommunitySlug}
                    onChange={e => setNewCommunitySlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="pro-form-field">
                <label className="pro-input-label">Category</label>
                <select
                  className="pro-select-control"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Technology">Technology & Software</option>
                  <option value="Design">Design & Creative</option>
                  <option value="Gaming">Gaming & Esports</option>
                  <option value="Education">Education & Science</option>
                  <option value="Music">Music & Entertainment</option>
                </select>
              </div>

              {/* Description */}
              <div className="pro-form-field">
                <label className="pro-input-label">Description (Optional)</label>
                <textarea
                  className="pro-textarea-control"
                  rows={3}
                  placeholder="What is this space about?"
                  value={newCommunityDesc}
                  onChange={e => setNewCommunityDesc(e.target.value)}
                />
              </div>

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
                  {creatingCommunity ? 'Creating Space...' : (newType === 'public' ? 'Create Public Page' : 'Create Private Community')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Join Requests Modal */}
      {showRequestsModal && (
        <div className="pro-modal-overlay" onClick={() => setShowRequestsModal(false)}>
          <div className="pro-space-modal requests-modal" onClick={e => e.stopPropagation()}>
            <div className="pro-modal-header">
              <h3 className="pro-modal-title">Pending Member Requests</h3>
              <button type="button" className="pro-modal-close-btn" onClick={() => setShowRequestsModal(false)}>✕</button>
            </div>
            <div className="pro-requests-body">
              {loadingRequests ? (
                <div className="pro-empty-notice">Loading requests...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="pro-empty-notice">No pending requests at this time.</div>
              ) : (
                <div className="pro-requests-list">
                  {pendingRequests.map(req => (
                    <div key={req.user_id} className="pro-request-card">
                      <div className="pro-request-user-info">
                        <UserAvatar avatarUrl={req.avatar_url} fallback={req.username} size={36} />
                        <div>
                          <strong>@{req.username}</strong>
                          <span className="pro-request-date">Requested {formatRelativeTime(req.requested_at)}</span>
                        </div>
                      </div>
                      <div className="pro-request-actions">
                        <button
                          type="button"
                          className="pro-btn-secondary small"
                          onClick={() => handleRejectRequest(currentCommunity!.slug, req.user_id)}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className="pro-btn-primary small"
                          onClick={() => handleApproveRequest(currentCommunity!.slug, req.user_id)}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {fullImageUrl && (
        <div className="pro-lightbox-overlay" onClick={() => setFullImageUrl(null)}>
          <button type="button" className="pro-lightbox-close-btn" onClick={() => setFullImageUrl(null)}>✕</button>
          <img src={fullImageUrl} alt="Full screen preview" className="pro-lightbox-image" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

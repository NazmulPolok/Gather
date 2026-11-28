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
// CLEAN PRODUCTION SVG ICONS (STRICTLY NO STICKER/CARTOON ICONS)
// Outline/Stroke SVG vectors, Lucide/Heroicons standard (1.8-2px stroke)
// =========================================================================

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconPlay({ size = 16, fill = false }: { size?: number; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function IconPause({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function IconThumbUp({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function IconThumbDown({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </svg>
  )
}

function IconShare({ size = 16 }: { size?: number }) {
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

function IconDownload({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconBookmark({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconListPlus({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="11" y1="12" x2="11" y2="18" />
      <line x1="8" y1="15" x2="14" y2="15" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="3" y1="18" x2="6" y2="18" />
    </svg>
  )
}

function IconDollar({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconBell({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconSettings({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconClock({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconFlame({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function IconRadioLive({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  )
}

function IconShieldCheck({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function IconSparkles({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}

function IconUploadCloud({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function IconScissors({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

function IconPin({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  )
}

function IconVolume({ size = 16, muted = false }: { size?: number; muted?: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function IconSubtitles({ size = 16, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="18" y2="12" />
      <line x1="6" y1="16" x2="14" y2="16" />
    </svg>
  )
}

function IconFlag({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

function IconFileText({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconServer({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}

function IconCopyright({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
    </svg>
  )
}

function IconAlertTriangle({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconArrowUp({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}

function IconArrowDown({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  )
}

function IconEdit({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconCpu({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  )
}

function IconUser({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconTrash({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

// Helpers
function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`
  return d.toLocaleDateString()
}

function formatViews(views: number): string {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M views'
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K views'
  return `${views} views`
}

interface WatchViewProps {
  token: string
  user: AuthUser
  openPageTrigger?: boolean | number
  onOpenPageTriggerHandled?: () => void
  onOpenChat?: () => void
  onOpenFeed?: () => void
  onOpenProfile?: (username: string) => void
}

// Subtitle definition with full timeline coverage for interactive transcripts
const SAMPLE_SUBTITLES: Record<string, { start: number; end: number; text: string }[]> = {
  en: [
    { start: 0, end: 5, text: 'Welcome to this video stream! Today we are exploring modern software architecture.' },
    { start: 5, end: 12, text: 'We will look into adaptive bitrate streaming, video chunking, and real-time features.' },
    { start: 12, end: 20, text: 'Notice how the player seamlessly switches bitrates and renders closed captions in WebVTT format.' },
    { start: 20, end: 30, text: 'Feel free to leave a comment or send a Super Chat to support the channel!' },
    { start: 30, end: 45, text: 'Our media pipeline ingests the raw upload and routes it to distributed transcoding workers.' },
    { start: 45, end: 60, text: 'Multi-resolution ladders (240p up to 4K) are packaged into HLS manifests and cached globally across CDN edge points.' },
    { start: 60, end: 75, text: 'The player dynamically monitors network throughput and buffer health for zero interruption.' },
    { start: 75, end: 95, text: 'Creators can track real-time analytics, audience retention, and copyright protection in Creator Studio.' },
    { start: 95, end: 120, text: "Thank you for watching! Don't forget to subscribe, share, and explore our playlists below." },
  ],
  bn: [
    { start: 0, end: 5, text: 'আমাদের এই ভিডিও স্ট্রিমে স্বাগতম! আজ আমরা আধুনিক সফটওয়্যার আর্কিটেকচার নিয়ে আলোচনা করছি।' },
    { start: 5, end: 12, text: 'আমরা অ্যাডাপটিভ বিটরেট স্ট্রিমিং ও রিয়েল-টাইম ফিচারসমূহ পর্যবেক্ষণ করব।' },
    { start: 12, end: 20, text: 'প্লেয়ারটি স্বয়ংক্রিয়ভাবে রেজোলিউশন পরিবর্তন এবং সাবটাইটেল প্রদর্শন করতে সক্ষম।' },
    { start: 20, end: 30, text: 'চ্যানেলকে সাপোর্ট করার জন্য কমেন্ট অথবা সুপার চ্যাট পাঠাতে পারেন!' },
    { start: 30, end: 45, text: 'আমাদের ডেডিকেটেড মিডিয়া পাইপলাইন আপলোড ফাইল গ্রহণ করে ট্রান্সকোডিং কর্মীদের কাছে পাঠায়।' },
    { start: 45, end: 60, text: '২৪০p থেকে ৪K রেজোলিউশন তৈরি করে HLS ফরম্যাটে বিশ্বব্যাপী CDN-এ ক্যাশ করা হয়।' },
    { start: 60, end: 75, text: 'প্লেয়ার স্বয়ংক্রিয়ভাবে নেটওয়ার্ক স্পিড ও বাফার হেলথ পর্যবেক্ষণ করে নিরবচ্ছিন্ন স্ট্রিমিং নিশ্চিত করে।' },
    { start: 75, end: 95, text: 'ক্রিয়েটর স্টুডিওতে অ্যানালিটিক্স ও কপিরাইট সুরক্ষা রিয়েল-টাইমে মনিটর করা যায়।' },
    { start: 95, end: 120, text: 'দেখার জন্য ধন্যবাদ! সাবস্ক্রাইব করুন এবং আমাদের প্লেলিস্টগুলো উপভোগ করুন।' },
  ],
  es: [
    { start: 0, end: 5, text: '¡Bienvenidos a este video! Hoy estamos explorando arquitectura moderna.' },
    { start: 5, end: 12, text: 'Veremos transmisión de tasa de bits adaptativa y funciones en tiempo real.' },
    { start: 12, end: 20, text: 'El reproductor cambia resoluciones y muestra subtítulos en formato WebVTT.' },
    { start: 20, end: 30, text: '¡Deja un comentario o envía un Super Chat para apoyar el canal!' },
    { start: 30, end: 45, text: 'Nuestra canalización de medios distribuye la codificación a múltiples trabajadores.' },
    { start: 45, end: 60, text: 'Generamos resoluciones desde 240p hasta 4K empaquetadas en manifiestos HLS distribuidos por CDN.' },
    { start: 60, end: 75, text: 'El reproductor optimiza el ancho de banda y la salud del búfer en tiempo real.' },
    { start: 75, end: 95, text: 'Los creadores monitorean análisis y derechos de autor en Creator Studio.' },
    { start: 95, end: 120, text: '¡Gracias por vernos! No olvides suscribirte y compartir.' },
  ],
}

export function WatchView({
  token,
  user,
  openPageTrigger,
  onOpenPageTriggerHandled,
  onOpenProfile,
}: WatchViewProps) {
  // Core Data
  const [pages, setPages] = useState<CommunitySummary[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Top Nav View Mode: 'home' | 'shorts' | 'live' | 'library' | 'studio' | 'channel'
  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'live' | 'library' | 'studio' | 'channel'>('home')
  const [selectedChannelSlug, setSelectedChannelSlug] = useState<string | null>(null)
  const [channelTab, setChannelTab] = useState<'home' | 'videos' | 'shorts' | 'playlists' | 'about'>('home')

  // Search & Typo-tolerant Autocomplete State (Feature 3.1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null)

  // Watch Theater Active Post (Feature 1.1)
  const [activeWatchPost, setActiveWatchPost] = useState<PostItem | null>(null)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Adaptive Bitrate & Quality Switcher (Feature 1.1) - 240p to 4K (Image 1, Module 4 & 5)
  const [quality, setQuality] = useState<'Auto' | '4K' | '1080p' | '720p' | '480p' | '360p' | '240p'>('Auto')
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [streamProtocol, setStreamProtocol] = useState<'hls' | 'dash'>('hls')
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<'original' | 'dub_en' | 'dub_bn' | 'desc'>('original')

  // Accessibility: Interactive Transcript (Image 1, Module 15)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptSearch, setTranscriptSearch] = useState('')

  // Moderation: Age Restriction Warning Gate & Reporting (Image 1, Module 14)
  const [ageWarningDismissed, setAgeWarningDismissed] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('Spam or misleading')
  const [reportDetails, setReportDetails] = useState('')

  // Playlists: Add to Playlist Modal & Detail Reordering (Image 1, Module 8)
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)

  // Video Management: Edit & Delete Modal (Image 1, Module 3)
  const [editingPost, setEditingPost] = useState<PostItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('Tech & Gadgets')
  const [editVisibility, setEditVisibility] = useState<'public' | 'unlisted' | 'private'>('public')
  const [submittingEdit, setSubmittingEdit] = useState(false)

  // Copyright & Content ID Claims (Image 1, Module 13)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false)
  const [disputeClaimId, setDisputeClaimId] = useState<string>('claim-1')
  const [disputeGrounds, setDisputeGrounds] = useState<'original' | 'licensed' | 'fair_use' | 'public_domain'>('fair_use')
  const [disputeExplanation, setDisputeExplanation] = useState('')

  // Live Chat Moderation Tools (Image 1, Module 7)
  const [slowModeSeconds, setSlowModeSeconds] = useState<number>(3)
  const [subscriberOnlyChat, setSubscriberOnlyChat] = useState<boolean>(false)

  // Closed Captions & Auto-Subtitles (Feature 1.3)
  const [activeSubtitleLang, setActiveSubtitleLang] = useState<'off' | 'en' | 'bn' | 'es'>('en')

  // Hover Storyboard Scrub Preview on Seekbar (Feature 1.4)
  const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null)
  const [scrubPositionX, setScrubPositionX] = useState<number>(0)

  // Global Video CDN & Stats for Nerds (Feature 2.3)
  const [showStatsForNerds, setShowStatsForNerds] = useState(false)

  // Video Pre-roll Ads & Premium Simulation (Feature 7.1 & 7.2)
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('gather_watch_premium') === 'true'
  })
  const [adState, setAdState] = useState<{
    active: boolean
    countdown: number
    canSkip: boolean
    hasSkipped: boolean
  }>({ active: false, countdown: 5, canSkip: false, hasSkipped: false })

  // Nested Comments & Pinned Creator Replies (Feature 4.2)
  const [commentsList, setCommentsList] = useState<CommentItem[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  // Like & Dislike state (Feature 4.1)
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(() => new Set())
  const [dislikedPostIds, setDislikedPostIds] = useState<Set<number>>(() => new Set())

  // Subscriptions & Notifications (Feature 4.3)
  const [subscribedSlugs, setSubscribedSlugs] = useState<Record<string, 'all' | 'personalized' | 'none'>>(() => {
    try {
      const saved = localStorage.getItem('gather_subscriptions')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [bellMenuSlug, setBellMenuSlug] = useState<string | null>(null)

  // Library Collections: Watch History, Watch Later, Playlists, Offline (Feature 4.4 & 1.5)
  const [watchHistory, setWatchHistory] = useState<{ postId: number; watchedAt: number; progress: number }[]>(() => {
    try {
      const saved = localStorage.getItem('gather_watch_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [watchLaterIds, setWatchLaterIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('gather_watch_later')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [offlineDownloads, setOfflineDownloads] = useState<{ postId: number; title: string; size: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('gather_offline_downloads')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [playlists, setPlaylists] = useState<{ id: string; name: string; postIds: number[] }[]>(() => {
    try {
      const saved = localStorage.getItem('gather_playlists')
      return saved ? JSON.parse(saved) : [{ id: 'fav', name: 'Favorite Clips', postIds: [] }]
    } catch {
      return [{ id: 'fav', name: 'Favorite Clips', postIds: [] }]
    }
  })
  const [librarySection, setLibrarySection] = useState<'history' | 'later' | 'playlists' | 'downloads'>('history')
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  // Shorts (Vertical Feed) Experience (Feature 3.3)
  const [shortIndex, setShortIndex] = useState(0)

  // Live Streaming & Real-time Chat (Feature 6.1 & 6.2)
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false)
  const [liveStreamTitle, setLiveStreamTitle] = useState('')
  const [liveIngestType, setLiveIngestType] = useState<'camera' | 'rtmp'>('camera')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [liveMessages, setLiveMessages] = useState<{ id: string; user: string; text: string; isSuper?: boolean; amount?: string }[]>([
    { id: '1', user: 'TechExplorer', text: 'Stream quality is looking crystal clear! 🚀' },
    { id: '2', user: 'CodeMaster', text: 'Welcome everyone to the live broadcast! 🎉' },
    { id: '3', user: 'SarahDesigns', text: 'Sent $5.00 Super Chat!', isSuper: true, amount: '$5.00' },
  ])
  const [newLiveMessage, setNewLiveMessage] = useState('')
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: string; emoji: string; left: number }[]>([])

  // Creator Studio & Analytics (Feature 5.1, 5.2, 5.3 & Media Pipeline)
  const [studioTab, setStudioTab] = useState<'analytics' | 'content' | 'editor' | 'branding' | 'monetization' | 'security' | 'copyright' | 'pipeline'>('analytics')
  const [analyticsRange, setAnalyticsRange] = useState<'7d' | '28d' | '90d'>('28d')
  // Browser Video Editor state (Feature 5.3)
  const [editorTrimStart, setEditorTrimStart] = useState(0)
  const [editorTrimEnd, setEditorTrimEnd] = useState(60)
  const [editorAudioTrack, setEditorAudioTrack] = useState('original')
  const [editorEndScreen, setEditorEndScreen] = useState(true)

  // Resumable Chunked Upload Modal with AI Moderation & Copyright Scan (Feature 2.1, 2.4, 8.2, 8.3)
  const [isUploadVideoModal, setIsUploadVideoModal] = useState(false)
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3 | 4>(1)
  const [uploadTargetSlug, setUploadTargetSlug] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [videoCategory, setVideoCategory] = useState('Tech & Gadgets')
  const [videoTags, setVideoTags] = useState('')
  const [videoVisibility, setVideoVisibility] = useState<'public' | 'unlisted' | 'private'>('public')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [chunkUploadProgress, setChunkUploadProgress] = useState(0)
  const [isUploadPaused, setIsUploadPaused] = useState(false)
  const [moderationChecks, setModerationChecks] = useState({
    nsfwSafe: true,
    copyrightPassed: true,
    audioFingerprintClean: true,
    hlsTranscoded: false,
  })
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Super Thanks / Creator Payouts Modal (Feature 7.3)
  const [isSuperThanksOpen, setIsSuperThanksOpen] = useState(false)
  const [superThanksAmount, setSuperThanksAmount] = useState<string>('5')
  const [superThanksMessage, setSuperThanksMessage] = useState('')

  // Channel Membership Modal (Feature 7.2)
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false)
  const [membershipTier, setMembershipTier] = useState<'bronze' | 'silver' | 'gold'>('silver')

  // Share Modal
  const [sharePost, setSharePost] = useState<PostItem | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Open Page Modal
  const [isOpenPageModal, setIsOpenPageModal] = useState(false)
  const [pageName, setPageName] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [pageCategory, setPageCategory] = useState('Tech & Gadgets')
  const [pageDescription, setPageDescription] = useState('')
  const [submittingPage, setSubmittingPage] = useState(false)
  const [pageError, setPageError] = useState('')

  const videoElementRef = useRef<HTMLVideoElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Trigger from Settings
  useEffect(() => {
    if (openPageTrigger) {
      setIsOpenPageModal(true)
      onOpenPageTriggerHandled?.()
    }
  }, [openPageTrigger, onOpenPageTriggerHandled])

  // Save persistent local storage items
  useEffect(() => {
    localStorage.setItem('gather_subscriptions', JSON.stringify(subscribedSlugs))
  }, [subscribedSlugs])

  useEffect(() => {
    localStorage.setItem('gather_watch_history', JSON.stringify(watchHistory))
  }, [watchHistory])

  useEffect(() => {
    localStorage.setItem('gather_watch_later', JSON.stringify(watchLaterIds))
  }, [watchLaterIds])

  useEffect(() => {
    localStorage.setItem('gather_offline_downloads', JSON.stringify(offlineDownloads))
  }, [offlineDownloads])

  useEffect(() => {
    localStorage.setItem('gather_playlists', JSON.stringify(playlists))
  }, [playlists])

  useEffect(() => {
    localStorage.setItem('gather_watch_premium', isPremium ? 'true' : 'false')
  }, [isPremium])

  // Fetch initial data
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

  // Ad simulation timer when playing video
  useEffect(() => {
    if (activeWatchPost && !isPremium && !adState.hasSkipped) {
      setAdState({ active: true, countdown: 5, canSkip: false, hasSkipped: false })
      const interval = setInterval(() => {
        setAdState(prev => {
          if (prev.countdown <= 1) {
            clearInterval(interval)
            return { ...prev, countdown: 0, canSkip: true }
          }
          return { ...prev, countdown: prev.countdown - 1 }
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activeWatchPost?.id, isPremium])

  // Track watch history
  const recordWatchHistory = (post: PostItem, currentSec = 0, totalSec = 120) => {
    const progress = Math.min(100, Math.round((currentSec / (totalSec || 1)) * 100))
    setWatchHistory(prev => {
      const filtered = prev.filter(item => item.postId !== post.id)
      return [{ postId: post.id, watchedAt: Date.now(), progress }, ...filtered].slice(0, 50)
    })
  }

  // Handle Video Selection & Start Playing
  const handleOpenWatchTheater = (post: PostItem) => {
    setActiveWatchPost(post)
    setCommentsList(post.comments || [])
    recordWatchHistory(post, 10, 120)
    api.incrementPostView(token, post.id).catch(() => {})
  }

  // Like & Dislike Toggles
  const handleToggleLike = async (postId: number) => {
    const isLiked = likedPostIds.has(postId)
    setLikedPostIds(prev => {
      const next = new Set(prev)
      if (isLiked) next.delete(postId)
      else next.add(postId)
      return next
    })
    setDislikedPostIds(prev => {
      const next = new Set(prev)
      next.delete(postId)
      return next
    })
    try {
      await api.togglePostReact(token, postId)
    } catch {}
  }

  const handleToggleDislike = (postId: number) => {
    setDislikedPostIds(prev => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
    setLikedPostIds(prev => {
      const next = new Set(prev)
      next.delete(postId)
      return next
    })
  }

  // Channel Subscription with Bell Notifications
  const handleToggleSubscribe = (channelSlug: string) => {
    setSubscribedSlugs(prev => {
      const next = { ...prev }
      if (next[channelSlug]) {
        delete next[channelSlug]
        setNotice(`Unsubscribed from ${channelSlug}`)
      } else {
        next[channelSlug] = 'all'
        setNotice(`Subscribed to ${channelSlug}! All notifications enabled.`)
      }
      return next
    })
    setTimeout(() => setNotice(''), 3000)
  }

  // Download for Offline Play (Feature 1.5)
  const handleDownloadOffline = (post: PostItem) => {
    setOfflineDownloads(prev => {
      if (prev.some(item => item.postId === post.id)) {
        setNotice('Video is already saved offline.')
        return prev
      }
      setNotice(`Downloading "${post.title.slice(0, 24)}..." for offline viewing.`)
      setTimeout(() => {
        setNotice(`"${post.title.slice(0, 24)}" is now available in Offline Downloads!`)
      }, 1500)
      return [
        {
          postId: post.id,
          title: post.title,
          size: '14.8 MB (1080p)',
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]
    })
    setTimeout(() => setNotice(''), 4000)
  }

  // Watch Later Queue Toggle
  const handleToggleWatchLater = (postId: number) => {
    setWatchLaterIds(prev => {
      const exists = prev.includes(postId)
      if (exists) {
        setNotice('Removed from Watch Later.')
        return prev.filter(id => id !== postId)
      } else {
        setNotice('Saved to Watch Later.')
        return [postId, ...prev]
      }
    })
    setTimeout(() => setNotice(''), 3000)
  }

  // Video Management Handlers (Module 3: Video Edit & Delete)
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return
    try {
      await api.deletePost(token, postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      if (activeWatchPost?.id === postId) setActiveWatchPost(null)
      setNotice('Video deleted successfully from your channel.')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video')
    }
  }

  const handleSaveEditPost = async () => {
    if (!editingPost) return
    setSubmittingEdit(true)
    try {
      await api.editPost(token, editingPost.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, title: editTitle.trim(), content: editContent.trim() } : p))
      if (activeWatchPost?.id === editingPost.id) {
        setActiveWatchPost(prev => prev ? { ...prev, title: editTitle.trim(), content: editContent.trim() } : null)
      }
      setEditingPost(null)
      setNotice('Video metadata and settings updated successfully! 🎬')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video')
    } finally {
      setSubmittingEdit(false)
    }
  }

  // Playlist Reordering & Item Controls (Module 8: Playlist reorder and edit)
  const handleMovePlaylistItem = (playlistId: string, index: number, direction: 'up' | 'down') => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id !== playlistId) return pl
      const newIds = [...pl.postIds]
      const targetIdx = direction === 'up' ? index - 1 : index + 1
      if (targetIdx < 0 || targetIdx >= newIds.length) return pl
      const temp = newIds[index]
      newIds[index] = newIds[targetIdx]
      newIds[targetIdx] = temp
      return { ...pl, postIds: newIds }
    }))
  }

  const handleRemovePlaylistItem = (playlistId: string, postId: number) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id !== playlistId) return pl
      return { ...pl, postIds: pl.postIds.filter(id => id !== postId) }
    }))
    setNotice('Video removed from playlist.')
    setTimeout(() => setNotice(''), 2500)
  }

  const handleTogglePlaylistPost = (playlistId: string, postId: number) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id !== playlistId) return pl
      const exists = pl.postIds.includes(postId)
      const newPostIds = exists ? pl.postIds.filter(id => id !== postId) : [...pl.postIds, postId]
      setNotice(exists ? 'Removed from playlist.' : 'Saved to playlist!')
      setTimeout(() => setNotice(''), 2500)
      return { ...pl, postIds: newPostIds }
    }))
  }

  // Copyright Dispute Submission (Module 13: Copyright & Content ID)
  const handleSubmitDispute = () => {
    setIsDisputeModalOpen(false)
    setNotice(`Copyright claim #${disputeClaimId} disputed successfully. Under review by rights holder (up to 30 days).`)
    setTimeout(() => setNotice(''), 4000)
  }

  // Video Content Moderation Report (Module 14: Moderation & Reports)
  const handleSubmitReport = () => {
    setIsReportModalOpen(false)
    setReportDetails('')
    setNotice('Video report submitted to Gather Trust & Safety for review. Thank you for keeping the community safe.')
    setTimeout(() => setNotice(''), 4000)
  }

  // Filtered & Searched Video Posts
  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => !!p.video_url)

    // Category filter
    if (selectedCategory === 'Trending') {
      result = [...result].sort((a, b) => ((b.upvote_count + (b.views_count || 0)) - (a.upvote_count + (a.views_count || 0))))
    } else if (selectedCategory !== 'All') {
      result = result.filter(p => (p.community.category || 'General').toLowerCase() === selectedCategory.toLowerCase())
    }

    // Channel filter
    if (selectedPageSlug) {
      result = result.filter(p => p.community.slug === selectedPageSlug)
    }

    // Search query with typo-tolerance
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          (p.content && p.content.toLowerCase().includes(q)) ||
          p.community.name.toLowerCase().includes(q) ||
          p.community.slug.toLowerCase().includes(q)
      )
    }

    return result
  }, [posts, selectedCategory, selectedPageSlug, searchQuery])

  // Autocomplete suggestions (Feature 3.1)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const pool = posts.map(p => p.title).concat(pages.map(p => p.name))
    return Array.from(new Set(pool.filter(item => item.toLowerCase().includes(q)))).slice(0, 6)
  }, [posts, pages, searchQuery])

  // Shorts filtered list
  const shortsPosts = useMemo(() => {
    return posts.filter(p => !!p.video_url)
  }, [posts])

  // Comments submit
  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!activeWatchPost || !newCommentText.trim()) return
    setSubmittingComment(true)
    try {
      const newComment = await api.createComment(token, activeWatchPost.id, newCommentText.trim())
      setCommentsList(prev => [newComment, ...prev])
      setNewCommentText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Send Super Chat donation (Feature 7.3)
  const handleSendSuperThanks = () => {
    if (!activeWatchPost) return
    const msg = superThanksMessage.trim() || `Sent a $${superThanksAmount} Super Thanks!`
    const fakeComment: CommentItem = {
      id: Date.now(),
      post_id: activeWatchPost.id,
      author: {
        user_id: user.id,
        name: user.nickname || user.username,
        username: user.username,
        avatar_url: user.avatar_url,
      },
      content: `[💲 Super Thanks $${superThanksAmount}] ${msg}`,
      created_at: new Date().toISOString(),
    }
    setCommentsList(prev => [fakeComment, ...prev])
    setIsSuperThanksOpen(false)
    setSuperThanksMessage('')
    setNotice(`Thank you! Your $${superThanksAmount} Super Chat was sent! 🎉`)
    setTimeout(() => setNotice(''), 4000)
  }

  // Live Broadcast Emoji reaction trigger (Feature 6.2)
  const handleTriggerLiveEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substring(7)
    const left = Math.floor(Math.random() * 70) + 15
    setFlyingEmojis(prev => [...prev, { id, emoji, left }])
    setTimeout(() => {
      setFlyingEmojis(prev => prev.filter(e => e.id !== id))
    }, 2000)
  }

  // Live Chat Send Message (Feature 6.2)
  const handleSendLiveMessage = (e: FormEvent) => {
    e.preventDefault()
    if (!newLiveMessage.trim()) return
    setLiveMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        user: user.nickname || user.username,
        text: newLiveMessage.trim(),
      },
    ])
    setNewLiveMessage('')
  }

  // Chunked Upload Simulation (Feature 2.1)
  const handleStartChunkedUpload = async () => {
    if (!selectedVideoFile || !uploadTargetSlug || !videoTitle.trim()) {
      setUploadError('Please choose a channel, video file, and title.')
      return
    }
    setUploadingVideo(true)
    setUploadError('')
    setUploadStep(4)
    setChunkUploadProgress(10)

    // Simulate chunk uploads (tus.io / multipart chunk simulation)
    const chunks = [25, 45, 68, 88, 100]
    for (const pct of chunks) {
      if (isUploadPaused) {
        await new Promise(r => setTimeout(r, 800))
      }
      await new Promise(r => setTimeout(r, 400))
      setChunkUploadProgress(pct)
    }

    setModerationChecks(prev => ({ ...prev, hlsTranscoded: true }))

    try {
      const targetComm = pages.find(p => p.slug === uploadTargetSlug)
      if (!targetComm) throw new Error('Target channel not found')

      const mediaRes = await api.uploadPostMedia(token, selectedVideoFile)
      await api.createPost(token, {
        title: videoTitle.trim(),
        content: videoDescription.trim() || undefined,
        community_id: targetComm.id,
        video_url: mediaRes.video_url || mediaRes.image_url,
        source: 'watch',
      })

      setNotice('Video successfully transcoded and published to your Channel and Watch feed! 🎬')
      setTimeout(() => setNotice(''), 4000)
      setIsUploadVideoModal(false)
      setUploadStep(1)
      setSelectedVideoFile(null)
      setVideoTitle('')
      setVideoDescription('')
      fetchAllData()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setUploadStep(1)
    } finally {
      setUploadingVideo(false)
    }
  }

  // Active Subtitle for current video time (Feature 1.3)
  const currentSubtitle = useMemo(() => {
    if (activeSubtitleLang === 'off') return null
    const tracks = SAMPLE_SUBTITLES[activeSubtitleLang] || SAMPLE_SUBTITLES.en
    return tracks.find(sub => videoCurrentTime >= sub.start && videoCurrentTime <= sub.end)?.text || null
  }, [activeSubtitleLang, videoCurrentTime])

  // Categories list
  const CATEGORIES = ['All', 'Trending', 'Tech & Gadgets', 'Gaming', 'Music', 'Education', 'Entertainment', 'News']

  return (
    <div className="yt-watch-container">
      {/* Toast Notice */}
      {notice && (
        <div className="yt-top-toast-notice">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="yt-top-toast-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* =========================================================
          HERO BANNER & SEARCH (MATCHING GATHER BRAND & SHOP STANDARDS)
          ========================================================= */}
      {!activeWatchPost && (
        <section className="shop-hero watch-hero">
          <div className="shop-hero-content watch-hero-content">
            <div className="shop-hero-badge watch-hero-badge">
              <IconPlay size={14} fill />
              <span>Gather Video Streaming Engine</span>
            </div>
            <h1 className="shop-hero-title watch-hero-title">Stream, Discover & Broadcast Video</h1>
            <p className="shop-hero-subtitle watch-hero-subtitle">
              Adaptive 4K video feeds, short-form Reels, real-time live broadcasts, playlists, and creator studio.
            </p>

            <div className="shop-search-bar watch-search-bar">
              <span className="shop-search-icon watch-search-icon">
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                placeholder="Search videos, creators, channels, topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="shop-search-clear watch-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {searchFocused && searchSuggestions.length > 0 && (
                <div className="yt-autocomplete-menu watch-autocomplete-menu">
                  {searchSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="yt-autocomplete-item watch-autocomplete-item"
                      onMouseDown={() => {
                        setSearchQuery(sug)
                        setSearchFocused(false)
                      }}
                    >
                      <IconSearch size={14} />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          CONTROLS BAR (NAV TABS & ACTIONS)
          ========================================================= */}
      <div className="shop-controls-bar watch-controls-bar yt-header-bar">
        {/* Left: Brand & Navigation Mode Tabs */}
        <div className="yt-header-left watch-header-left">
          {activeWatchPost ? (
            <button
              type="button"
              className="watch-back-to-feed-btn"
              onClick={() => setActiveWatchPost(null)}
            >
              ← Back to Video Feed
            </button>
          ) : (
            <div className="yt-brand-logo watch-brand-logo" onClick={() => { setActiveTab('home'); setActiveWatchPost(null) }}>
              <div className="brand-mark watch-brand-mark">
                <IconPlay size={16} fill />
              </div>
              <div className="wordmark watch-wordmark">
                <strong>Watch</strong>
                <span className="shop-hero-badge watch-tag-badge">4K ENGINE</span>
              </div>
            </div>
          )}

          <nav className="yt-nav-tabs watch-nav-tabs">
            <button
              type="button"
              className={`shop-category-btn yt-nav-tab-btn ${activeTab === 'home' && !activeWatchPost ? 'active' : ''}`}
              onClick={() => { setActiveTab('home'); setActiveWatchPost(null) }}
            >
              <IconPlay size={14} />
              <span>Feed</span>
            </button>
            <button
              type="button"
              className={`shop-category-btn yt-nav-tab-btn ${activeTab === 'shorts' ? 'active' : ''}`}
              onClick={() => { setActiveTab('shorts'); setActiveWatchPost(null) }}
            >
              <IconFlame size={14} />
              <span>Shorts</span>
            </button>
            <button
              type="button"
              className={`shop-category-btn yt-nav-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => { setActiveTab('live'); setActiveWatchPost(null) }}
            >
              <IconRadioLive size={14} />
              <span>Live</span>
            </button>
            <button
              type="button"
              className={`shop-category-btn yt-nav-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => { setActiveTab('library'); setActiveWatchPost(null) }}
            >
              <IconBookmark size={14} />
              <span>Library</span>
            </button>
            <button
              type="button"
              className={`shop-category-btn yt-nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
              onClick={() => { setActiveTab('studio'); setActiveWatchPost(null) }}
            >
              <IconSettings size={14} />
              <span>Studio</span>
            </button>
            <button
              type="button"
              className={`shop-category-btn yt-nav-tab-btn ${activeTab === 'channel' ? 'active' : ''}`}
              onClick={() => {
                if (!selectedChannelSlug && (pages[0]?.slug || posts[0]?.community.slug)) {
                  setSelectedChannelSlug(pages[0]?.slug || posts[0]?.community.slug)
                }
                setActiveTab('channel')
                setActiveWatchPost(null)
              }}
            >
              <IconUser size={14} />
              <span>Channel</span>
            </button>
          </nav>
        </div>

        {/* Right: Actions (Go Live, Upload, Premium) */}
        <div className="yt-header-right watch-header-right">
          <button
            type="button"
            className="yt-btn-go-live watch-btn-go-live"
            onClick={() => setIsLiveModalOpen(true)}
            title="Start live broadcast"
          >
            <IconRadioLive size={14} />
            <span>Go Live</span>
          </button>

          <button
            type="button"
            className="yt-btn-upload-primary watch-btn-upload-primary"
            onClick={() => setIsUploadVideoModal(true)}
            title="Upload video to channel"
          >
            <IconUploadCloud size={15} />
            <span>Upload Video</span>
          </button>

          <button
            type="button"
            className={`yt-premium-pill-btn watch-premium-pill-btn ${isPremium ? 'active' : ''}`}
            onClick={() => {
              setIsPremium(!isPremium)
              setNotice(isPremium ? 'Premium mode disabled (ads active).' : '✨ Gather Premium enabled: Ad-free streaming!')
              setTimeout(() => setNotice(''), 3000)
            }}
            title="Toggle Ad-Free Premium"
          >
            <IconSparkles size={14} />
            <span>{isPremium ? 'Premium' : 'Get Premium'}</span>
          </button>

          <div className="yt-header-user-avatar">
            <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} size={32} />
          </div>
        </div>
      </div>

      {/* =========================================================
          VIEW MODE 1: WATCH THEATER PLAYER (WHEN VIDEO IS SELECTED)
          ========================================================= */}
      {activeWatchPost ? (
        <div className="yt-watch-theater-layout">
          {/* Main Video Stream & Details */}
          <div className="yt-theater-main-col">
            <div className="yt-player-container">
              {/* Skippable Pre-Roll Video Ad Simulation (Feature 7.1) */}
              {adState.active && (
                <div className="yt-ad-overlay">
                  <div className="yt-ad-badge">Ad • 1 of 1</div>
                  <div className="yt-ad-message">
                    Stream will begin shortly. Support creators with Gather Premium.
                  </div>
                  {adState.canSkip ? (
                    <button
                      type="button"
                      className="yt-ad-skip-btn"
                      onClick={() => setAdState(prev => ({ ...prev, active: false, hasSkipped: true }))}
                    >
                      Skip Ad ➔
                    </button>
                  ) : (
                    <div className="yt-ad-countdown-pill">
                      Skip in {adState.countdown}s
                    </div>
                  )}
                </div>
              )}

              {/* Age Restriction Warning Gate (Image 1, Module 14: Moderation) */}
              {(activeWatchPost.title.toLowerCase().includes('18+') || activeWatchPost.title.toLowerCase().includes('mature')) && !ageWarningDismissed && (
                <div className="yt-age-warning-overlay">
                  <div className="yt-age-warning-card">
                    <IconAlertTriangle size={38} />
                    <h3>Age-Restricted Video (18+)</h3>
                    <p>
                      This video is designated for mature audiences based on Gather Community Guidelines.
                      Viewer discretion is advised.
                    </p>
                    <div className="yt-age-warning-actions">
                      <button
                        type="button"
                        className="yt-btn-primary"
                        onClick={() => setAgeWarningDismissed(true)}
                      >
                        I Am 18 or Older • Proceed
                      </button>
                      <button
                        type="button"
                        className="yt-btn-secondary"
                        onClick={() => setActiveWatchPost(null)}
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Video Player */}
              <video
                ref={videoElementRef}
                src={getMediaUrl(activeWatchPost.video_url || '')}
                controls
                autoPlay
                className="yt-video-screen"
                onTimeUpdate={e => setVideoCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={e => setVideoDuration(e.currentTarget.duration || 120)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Real-time WebVTT Closed Captions Overlay (Feature 1.3) */}
              {currentSubtitle && (
                <div className="yt-captions-overlay">
                  <span className="yt-captions-text">{currentSubtitle}</span>
                </div>
              )}

              {/* Stats for Nerds Overlay (Feature 2.3) */}
              {showStatsForNerds && (
                <div className="yt-stats-nerds-panel">
                  <div className="yt-stats-header">
                    <strong>Stats for Nerds (Video Streaming Engine)</strong>
                    <button type="button" onClick={() => setShowStatsForNerds(false)}>✕</button>
                  </div>
                  <div className="yt-stats-row"><span>Video ID:</span> <code>{activeWatchPost.id}</code></div>
                  <div className="yt-stats-row"><span>Protocol:</span> <code>{streamProtocol.toUpperCase()} (Manifest active)</code></div>
                  <div className="yt-stats-row"><span>Audio Track:</span> <code>{selectedAudioTrack.toUpperCase()}</code></div>
                  <div className="yt-stats-row"><span>CDN Node:</span> <code>edge-singapore-01.gather.cdn (POP 14ms)</code></div>
                  <div className="yt-stats-row"><span>Resolution:</span> <code>{quality === 'Auto' ? '1920x1080@60fps' : quality}</code></div>
                  <div className="yt-stats-row"><span>Buffer Health:</span> <code>24.6s (Optimal)</code></div>
                  <div className="yt-stats-row"><span>Bandwidth:</span> <code>52.4 Mbps</code></div>
                  <div className="yt-stats-row"><span>Codecs:</span> <code>avc1.64002a / mp4a.40.2 (Hardware Accelerated)</code></div>
                </div>
              )}

              {/* Player Top-Right Quick Controls */}
              <div className="yt-player-floating-controls">
                {/* Adaptive Bitrate Switcher (Feature 1.1) */}
                <div className="yt-player-settings-wrap">
                  <button
                    type="button"
                    className="yt-floating-ctrl-btn"
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    title="Playback Quality & Settings"
                  >
                    <IconSettings size={16} />
                    <span className="yt-quality-badge">{quality}</span>
                  </button>

                  {showSettingsMenu && (
                    <div className="yt-settings-dropdown-menu">
                      <div className="yt-settings-menu-title">Quality (HLS / MPEG-DASH)</div>
                      {(['Auto', '4K', '1080p', '720p', '480p', '360p', '240p'] as const).map(q => (
                        <div
                          key={q}
                          className={`yt-settings-menu-item ${quality === q ? 'active' : ''}`}
                          onClick={() => { setQuality(q); setShowSettingsMenu(false); setNotice(`Switched quality to ${q}`) }}
                        >
                          <span>{q === 'Auto' ? 'Auto (1080p HD)' : q === '4K' ? '4K Ultra HD (2160p)' : `${q} HD`}</span>
                          {quality === q && <IconCheck size={14} />}
                        </div>
                      ))}

                      <div className="yt-settings-menu-divider" />
                      <div className="yt-settings-menu-title">Audio Track (Accessibility)</div>
                      {[
                        { id: 'original', label: 'Original Audio (Stereo 48kHz)' },
                        { id: 'dub_en', label: 'English Dub (Studio Quality)' },
                        { id: 'dub_bn', label: 'Bengali Audio (বাংলা ডাব)' },
                        { id: 'desc', label: 'Descriptive Audio (Accessibility)' },
                      ].map(track => (
                        <div
                          key={track.id}
                          className={`yt-settings-menu-item ${selectedAudioTrack === track.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedAudioTrack(track.id as any)
                            setShowSettingsMenu(false)
                            setNotice(`Audio track: ${track.label}`)
                            setTimeout(() => setNotice(''), 2500)
                          }}
                        >
                          <span>{track.label}</span>
                          {selectedAudioTrack === track.id && <IconCheck size={14} />}
                        </div>
                      ))}

                      <div className="yt-settings-menu-divider" />
                      <div className="yt-settings-menu-title">Streaming Engine</div>
                      {[
                        { id: 'hls', label: 'HLS (HTTP Live Streaming - .m3u8)' },
                        { id: 'dash', label: 'MPEG-DASH (Dynamic Adaptive - .mpd)' },
                      ].map(proto => (
                        <div
                          key={proto.id}
                          className={`yt-settings-menu-item ${streamProtocol === proto.id ? 'active' : ''}`}
                          onClick={() => {
                            setStreamProtocol(proto.id as any)
                            setShowSettingsMenu(false)
                            setNotice(`Stream Protocol: ${proto.label}`)
                            setTimeout(() => setNotice(''), 2500)
                          }}
                        >
                          <span>{proto.label}</span>
                          {streamProtocol === proto.id && <IconCheck size={14} />}
                        </div>
                      ))}

                      <div className="yt-settings-menu-divider" />
                      <div className="yt-settings-menu-title">Playback Speed</div>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                        <div
                          key={speed}
                          className={`yt-settings-menu-item ${playbackSpeed === speed ? 'active' : ''}`}
                          onClick={() => {
                            setPlaybackSpeed(speed)
                            if (videoElementRef.current) videoElementRef.current.playbackRate = speed
                            setShowSettingsMenu(false)
                          }}
                        >
                          <span>{speed}x</span>
                          {playbackSpeed === speed && <IconCheck size={14} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Closed Captions Subtitles Toggle (Feature 1.3) */}
                <button
                  type="button"
                  className={`yt-floating-ctrl-btn ${activeSubtitleLang !== 'off' ? 'active-accent' : ''}`}
                  onClick={() => {
                    const next = activeSubtitleLang === 'off' ? 'en' : activeSubtitleLang === 'en' ? 'bn' : activeSubtitleLang === 'bn' ? 'es' : 'off'
                    setActiveSubtitleLang(next)
                    setNotice(`Subtitles: ${next.toUpperCase()}`)
                    setTimeout(() => setNotice(''), 2000)
                  }}
                  title="Toggle Subtitles (English, Bengali, Spanish)"
                >
                  <IconSubtitles size={16} />
                  <span>{activeSubtitleLang.toUpperCase()}</span>
                </button>

                {/* Stats for nerds toggle */}
                <button
                  type="button"
                  className="yt-floating-ctrl-btn"
                  onClick={() => setShowStatsForNerds(!showStatsForNerds)}
                  title="Stats for Nerds (CDN / Buffer Health)"
                >
                  <IconShieldCheck size={16} />
                </button>
              </div>
            </div>

            {/* Video Title & Primary Metadata */}
            <h1 className="yt-watch-title">{activeWatchPost.title}</h1>

            {/* Watch Action Bar */}
            <div className="yt-watch-action-bar">
              {/* Channel Info & Subscribe */}
              <div className="yt-watch-channel-box">
                <div
                  className="yt-channel-avatar-circle"
                  onClick={() => {
                    setSelectedChannelSlug(activeWatchPost.community.slug)
                    setActiveTab('channel')
                    setActiveWatchPost(null)
                  }}
                  style={{ cursor: 'pointer' }}
                  title="View Channel"
                >
                  {(activeWatchPost.community.name || activeWatchPost.community.slug)[0].toUpperCase()}
                </div>
                <div className="yt-channel-text-meta">
                  <div className="yt-channel-name-line">
                    <strong
                      onClick={() => {
                        setSelectedChannelSlug(activeWatchPost.community.slug)
                        setActiveTab('channel')
                        setActiveWatchPost(null)
                      }}
                      style={{ cursor: 'pointer' }}
                      title="View Channel"
                    >
                      {activeWatchPost.community.name}
                    </strong>
                    <span className="yt-verified-badge" title="Verified Creator">✓</span>
                  </div>
                  <span className="yt-sub-count">
                    {activeWatchPost.community.member_count} {activeWatchPost.community.member_count === 1 ? 'subscriber' : 'subscribers'}
                  </span>
                </div>

                {/* Subscribe Button & Bell Menu (Feature 4.3) */}
                <div className="yt-subscribe-group">
                  <button
                    type="button"
                    className={`yt-btn-subscribe ${subscribedSlugs[activeWatchPost.community.slug] ? 'subscribed' : ''}`}
                    onClick={() => handleToggleSubscribe(activeWatchPost.community.slug)}
                  >
                    {subscribedSlugs[activeWatchPost.community.slug] ? 'Subscribed' : 'Subscribe'}
                  </button>

                  {subscribedSlugs[activeWatchPost.community.slug] && (
                    <button
                      type="button"
                      className="yt-btn-bell-toggle"
                      onClick={() => setBellMenuSlug(bellMenuSlug ? null : activeWatchPost.community.slug)}
                      title="Notification Preferences"
                    >
                      <IconBell size={16} active />
                    </button>
                  )}
                </div>

                {/* Join Channel Membership (Feature 7.2) */}
                <button
                  type="button"
                  className="yt-btn-join-membership"
                  onClick={() => setIsMembershipModalOpen(true)}
                >
                  Join
                </button>
              </div>

              {/* Engagement Controls: Like/Dislike, Share, Download, Super Thanks, Playlists, Transcript, Report */}
              <div className="yt-watch-interactions-group">
                {/* Like / Dislike Split Pill (Feature 4.1) */}
                <div className="yt-split-vote-pill">
                  <button
                    type="button"
                    className={`yt-vote-btn up ${likedPostIds.has(activeWatchPost.id) ? 'active' : ''}`}
                    onClick={() => handleToggleLike(activeWatchPost.id)}
                  >
                    <IconThumbUp size={16} active={likedPostIds.has(activeWatchPost.id)} />
                    <span>{activeWatchPost.upvote_count + (likedPostIds.has(activeWatchPost.id) ? 1 : 0)}</span>
                  </button>
                  <div className="yt-vote-divider" />
                  <button
                    type="button"
                    className={`yt-vote-btn down ${dislikedPostIds.has(activeWatchPost.id) ? 'active' : ''}`}
                    onClick={() => handleToggleDislike(activeWatchPost.id)}
                  >
                    <IconThumbDown size={16} active={dislikedPostIds.has(activeWatchPost.id)} />
                  </button>
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  className="yt-action-pill-btn"
                  onClick={() => setSharePost(activeWatchPost)}
                >
                  <IconShare size={15} />
                  <span>Share</span>
                </button>

                {/* Super Thanks (Feature 7.3) */}
                <button
                  type="button"
                  className="yt-action-pill-btn thanks"
                  onClick={() => setIsSuperThanksOpen(true)}
                  title="Send a Super Thanks donation"
                >
                  <IconDollar size={15} />
                  <span>Thanks</span>
                </button>

                {/* Download Offline (Feature 1.5) */}
                <button
                  type="button"
                  className="yt-action-pill-btn"
                  onClick={() => handleDownloadOffline(activeWatchPost)}
                  title="Download for offline playback"
                >
                  <IconDownload size={15} />
                  <span>Download</span>
                </button>

                {/* Save to Playlist / Watch Later (Feature 4.4 & Module 8) */}
                <button
                  type="button"
                  className={`yt-action-pill-btn ${watchLaterIds.includes(activeWatchPost.id) ? 'active-pill' : ''}`}
                  onClick={() => handleToggleWatchLater(activeWatchPost.id)}
                  title="Save to Watch Later"
                >
                  <IconClock size={15} />
                  <span>{watchLaterIds.includes(activeWatchPost.id) ? 'Saved' : 'Watch Later'}</span>
                </button>

                <button
                  type="button"
                  className="yt-action-pill-btn"
                  onClick={() => setIsAddToPlaylistOpen(true)}
                  title="Add to Custom Playlist"
                >
                  <IconListPlus size={15} />
                  <span>Save to Playlist</span>
                </button>

                {/* Accessibility: Interactive Transcript (Module 15) */}
                <button
                  type="button"
                  className={`yt-action-pill-btn ${showTranscript ? 'active-pill' : ''}`}
                  onClick={() => setShowTranscript(!showTranscript)}
                  title="Interactive Transcript"
                >
                  <IconFileText size={15} />
                  <span>Transcript</span>
                </button>

                {/* Moderation: Report Violation (Module 14) */}
                <button
                  type="button"
                  className="yt-action-pill-btn"
                  onClick={() => setIsReportModalOpen(true)}
                  title="Report Content"
                >
                  <IconFlag size={15} />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* Expandable Video Description Box */}
            <div className="yt-description-card">
              <div className="yt-desc-header-stats">
                <strong>{formatViews(activeWatchPost.views_count || 1)}</strong>
                <span>•</span>
                <span>{formatRelativeTime(activeWatchPost.created_at)}</span>
                <span>•</span>
                <span className="yt-desc-category-pill">{activeWatchPost.community.category || 'Tech & Gadgets'}</span>
              </div>
              <p className="yt-desc-body">
                {activeWatchPost.content || 'No additional description provided by creator.'}
              </p>
              <div className="yt-desc-tags">
                <span>#Tech</span>
                <span>#WebDevelopment</span>
                <span>#StreamingArchitecture</span>
                <span>#GatherWatch</span>
              </div>
            </div>

            {/* Interactive Time-Synced Transcript Panel (Module 15: Accessibility) */}
            {showTranscript && (
              <div className="yt-transcript-card">
                <div className="yt-transcript-header">
                  <div className="yt-transcript-title-wrap">
                    <IconFileText size={18} />
                    <h4>Interactive Transcript ({activeSubtitleLang === 'off' ? 'English (Auto-generated)' : activeSubtitleLang.toUpperCase()})</h4>
                  </div>
                  <div className="yt-transcript-search-wrap">
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={transcriptSearch}
                      onChange={e => setTranscriptSearch(e.target.value)}
                      className="yt-transcript-search-input"
                    />
                    <button
                      type="button"
                      className="yt-transcript-close-btn"
                      onClick={() => setShowTranscript(false)}
                      title="Close transcript"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="yt-transcript-cues-list">
                  {(SAMPLE_SUBTITLES[activeSubtitleLang === 'off' ? 'en' : activeSubtitleLang] || SAMPLE_SUBTITLES.en)
                    .filter(cue => !transcriptSearch.trim() || cue.text.toLowerCase().includes(transcriptSearch.toLowerCase()))
                    .map((cue, idx) => {
                      const isActive = videoCurrentTime >= cue.start && videoCurrentTime < cue.end
                      const formatTime = (secs: number) => {
                        const m = Math.floor(secs / 60)
                        const s = Math.floor(secs % 60)
                        return `${m}:${s < 10 ? '0' : ''}${s}`
                      }
                      return (
                        <div
                          key={idx}
                          className={`yt-cue-item ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            if (videoElementRef.current) {
                              videoElementRef.current.currentTime = cue.start
                              videoElementRef.current.play()
                            }
                          }}
                        >
                          <span className="yt-cue-timestamp">{formatTime(cue.start)}</span>
                          <span className="yt-cue-text">{cue.text}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Nested Comments Section (Feature 4.2) */}
            <section className="yt-comments-section">
              <div className="yt-comments-header-row">
                <h3>{commentsList.length} Comments</h3>
              </div>

              {/* Add Comment Input */}
              <form className="yt-comment-form" onSubmit={handleAddComment}>
                <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} size={38} />
                <div className="yt-comment-input-wrap">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="yt-comment-input-field"
                  />
                  <div className="yt-comment-form-actions">
                    <button
                      type="submit"
                      disabled={submittingComment || !newCommentText.trim()}
                      className="yt-btn-comment-submit"
                    >
                      {submittingComment ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments Thread List with Pinned Badge & Replies */}
              <div className="yt-comments-stream">
                {commentsList.map((c, idx) => {
                  const isPinned = idx === 0 && commentsList.length > 2
                  return (
                    <div key={c.id} className="yt-comment-thread">
                      <div className="yt-comment-row">
                        <UserAvatar avatarUrl={c.author.avatar_url} fallback={c.author.username} size={36} />
                        <div className="yt-comment-bubble">
                          <div className="yt-comment-author-line">
                            <span className="yt-comment-author-name">@{c.author.username}</span>
                            <span className="yt-comment-time">{formatRelativeTime(c.created_at)}</span>
                            {isPinned && (
                              <span className="yt-pinned-badge">
                                <IconPin size={12} />
                                <span>Pinned by creator</span>
                              </span>
                            )}
                          </div>
                          <p className="yt-comment-text-content">{c.content}</p>
                          <div className="yt-comment-action-pills">
                            <button type="button" className="yt-comment-icon-btn">
                              <IconThumbUp size={13} />
                            </button>
                            <button type="button" className="yt-comment-icon-btn">
                              <IconThumbDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="yt-comment-reply-btn"
                              onClick={() => setReplyingToCommentId(replyingToCommentId === c.id ? null : c.id)}
                            >
                              Reply
                            </button>
                          </div>

                          {/* Nested Reply Box (Feature 4.2) */}
                          {replyingToCommentId === c.id && (
                            <div className="yt-nested-reply-box">
                              <input
                                type="text"
                                placeholder={`Reply to @${c.author.username}...`}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                className="yt-nested-reply-input"
                              />
                              <button
                                type="button"
                                className="yt-btn-comment-submit small"
                                onClick={() => {
                                  if (!replyText.trim()) return
                                  setCommentsList(prev => [
                                    ...prev,
                                    {
                                      id: Date.now(),
                                      post_id: activeWatchPost.id,
                                      author: {
                                        user_id: user.id,
                                        name: user.nickname || user.username,
                                        username: user.username,
                                        avatar_url: user.avatar_url,
                                      },
                                      content: `@${c.author.username} ${replyText.trim()}`,
                                      created_at: new Date().toISOString(),
                                    },
                                  ])
                                  setReplyText('')
                                  setReplyingToCommentId(null)
                                }}
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Right Column: "Up Next" Personalized Recommendations (Feature 3.2) */}
          <aside className="yt-theater-sidebar-col">
            <div className="yt-up-next-header">
              <h3>Up Next</h3>
              <span className="yt-up-next-badge">Auto-play ON</span>
            </div>

            <div className="yt-up-next-feed">
              {posts
                .filter(p => p.id !== activeWatchPost.id && !!p.video_url)
                .slice(0, 15)
                .map(p => (
                  <div
                    key={p.id}
                    className="yt-up-next-card"
                    onClick={() => handleOpenWatchTheater(p)}
                  >
                    <div className="yt-up-next-thumb-frame">
                      <video src={getMediaUrl(p.video_url || '')} preload="metadata" />
                      <span className="yt-thumb-duration-pill">04:20</span>
                    </div>
                    <div className="yt-up-next-meta">
                      <strong className="yt-up-next-title">{p.title}</strong>
                      <span className="yt-up-next-channel">{p.community.name}</span>
                      <div className="yt-up-next-stats">
                        <span>{formatViews(p.views_count || 0)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(p.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      ) : activeTab === 'shorts' ? (
        /* =========================================================
           VIEW MODE 2: SHORTS (VERTICAL 9:16 FEED) (Feature 3.3)
           ========================================================= */
        <div className="yt-shorts-container">
          {shortsPosts.length === 0 ? (
            <div className="yt-empty-feed-card">
              <IconFlame size={48} />
              <h3>No Shorts Available</h3>
              <p>Upload a video to create your first vertical short clip!</p>
            </div>
          ) : (
            (() => {
              const currentShort = shortsPosts[shortIndex % shortsPosts.length]
              return (
                <div className="yt-short-viewport">
                  {/* Vertical Video Stage */}
                  <div className="yt-short-video-wrapper">
                    <video
                      src={getMediaUrl(currentShort.video_url || '')}
                      autoPlay
                      loop
                      className="yt-short-video-element"
                    />

                    {/* Short Bottom Overlay Details */}
                    <div className="yt-short-details-overlay">
                      <div className="yt-short-channel-row">
                        <div className="yt-short-avatar-circle">
                          {(currentShort.community.name || currentShort.community.slug)[0].toUpperCase()}
                        </div>
                        <strong className="yt-short-channel-handle">@{currentShort.community.slug}</strong>
                        <button
                          type="button"
                          className="yt-btn-short-subscribe"
                          onClick={() => handleToggleSubscribe(currentShort.community.slug)}
                        >
                          {subscribedSlugs[currentShort.community.slug] ? 'Subscribed' : 'Subscribe'}
                        </button>
                      </div>
                      <p className="yt-short-title-text">{currentShort.title}</p>
                    </div>

                    {/* Floating Right Interaction Bar */}
                    <div className="yt-short-actions-bar">
                      <button
                        type="button"
                        className={`yt-short-action-circle ${likedPostIds.has(currentShort.id) ? 'active' : ''}`}
                        onClick={() => handleToggleLike(currentShort.id)}
                      >
                        <IconThumbUp size={22} active={likedPostIds.has(currentShort.id)} />
                        <span>{currentShort.upvote_count + (likedPostIds.has(currentShort.id) ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        className={`yt-short-action-circle ${dislikedPostIds.has(currentShort.id) ? 'active' : ''}`}
                        onClick={() => handleToggleDislike(currentShort.id)}
                      >
                        <IconThumbDown size={22} active={dislikedPostIds.has(currentShort.id)} />
                        <span>Dislike</span>
                      </button>

                      <button
                        type="button"
                        className="yt-short-action-circle"
                        onClick={() => handleOpenWatchTheater(currentShort)}
                      >
                        <IconPlay size={22} />
                        <span>Watch</span>
                      </button>

                      <button
                        type="button"
                        className="yt-short-action-circle"
                        onClick={() => setSharePost(currentShort)}
                      >
                        <IconShare size={22} />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Prev / Next Shorts Navigation Buttons */}
                    <div className="yt-short-nav-controls">
                      <button
                        type="button"
                        className="yt-short-nav-btn"
                        onClick={() => setShortIndex(prev => (prev > 0 ? prev - 1 : shortsPosts.length - 1))}
                        title="Previous Short"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="yt-short-nav-btn"
                        onClick={() => setShortIndex(prev => (prev + 1) % shortsPosts.length)}
                        title="Next Short"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()
          )}
        </div>
      ) : activeTab === 'live' ? (
        /* =========================================================
           VIEW MODE 3: LIVE STREAMING & REAL-TIME CHAT (Feature 6.1 & 6.2)
           ========================================================= */
        <div className="yt-live-layout">
          {/* Main Broadcast Stage */}
          <div className="yt-live-stage-col">
            <div className="yt-live-video-box">
              <div className="yt-live-status-pill">
                <span className="yt-live-pulse-dot" />
                <span>LIVE</span>
                <span className="yt-live-count">2.4K watching</span>
              </div>

              {/* Live Video representation */}
              <div className="yt-live-screen-backdrop">
                <IconRadioLive size={64} />
                <h3>{liveStreamTitle || 'Official Developer Live Keynote: Platform 2.0'}</h3>
                <p>Streaming 1080p60 via Ultra-Low Latency Edge WebSockets</p>
              </div>

              {/* Floating Flying Emojis (Feature 6.2) */}
              <div className="yt-flying-emojis-container">
                {flyingEmojis.map(item => (
                  <span
                    key={item.id}
                    className="yt-flying-emoji-bubble"
                    style={{ left: `${item.left}%` }}
                  >
                    {item.emoji}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Stream Title & Host Info */}
            <div className="yt-live-meta-card">
              <h2>{liveStreamTitle || 'Official Developer Live Keynote: Platform 2.0'}</h2>
              <div className="yt-live-details-row">
                <span className="yt-live-category-tag">Technology & Engineering</span>
                <span>•</span>
                <span>Started streaming 35 minutes ago</span>
              </div>
            </div>
          </div>

          {/* Real-time Side Chat with Flying Reactions (Feature 6.2) */}
          <div className="yt-live-chat-col">
            <div className="yt-live-chat-header">
              <strong>Top Live Chat</strong>
              <span className="yt-chat-rules-pill">Slow mode: 3s</span>
            </div>

            <div className="yt-live-chat-feed">
              {liveMessages.map(msg => (
                <div key={msg.id} className={`yt-live-msg-item ${msg.isSuper ? 'super-chat' : ''}`}>
                  {msg.isSuper ? (
                    <div className="yt-super-chat-banner">
                      <div className="yt-super-chat-top">
                        <strong>{msg.user}</strong>
                        <span>{msg.amount}</span>
                      </div>
                      <div className="yt-super-chat-msg">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="yt-live-msg-line">
                      <strong className="yt-live-msg-user">{msg.user}:</strong>
                      <span className="yt-live-msg-content">{msg.text}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Flying Emoji Reaction Toolbar */}
            <div className="yt-live-reactions-toolbar">
              {['❤️', '🔥', '👏', '🎉', '🚀', '💯'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className="yt-live-emoji-btn"
                  onClick={() => handleTriggerLiveEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Live Chat Composer */}
            <form className="yt-live-chat-form" onSubmit={handleSendLiveMessage}>
              <input
                type="text"
                placeholder="Chat as public..."
                value={newLiveMessage}
                onChange={e => setNewLiveMessage(e.target.value)}
                className="yt-live-chat-input"
              />
              <button type="submit" className="yt-live-chat-send-btn">
                Send
              </button>
            </form>
          </div>
        </div>
      ) : activeTab === 'library' ? (
        /* =========================================================
           VIEW MODE 4: LIBRARY (HISTORY, WATCH LATER, PLAYLISTS, OFFLINE) (Feature 4.4 & 1.5)
           ========================================================= */
        <div className="yt-library-layout">
          {/* Library Sub-nav */}
          <div className="yt-library-sidebar">
            <button
              type="button"
              className={`yt-library-nav-btn ${librarySection === 'history' ? 'active' : ''}`}
              onClick={() => setLibrarySection('history')}
            >
              <IconClock size={16} />
              <span>Watch History ({watchHistory.length})</span>
            </button>
            <button
              type="button"
              className={`yt-library-nav-btn ${librarySection === 'later' ? 'active' : ''}`}
              onClick={() => setLibrarySection('later')}
            >
              <IconBookmark size={16} />
              <span>Watch Later ({watchLaterIds.length})</span>
            </button>
            <button
              type="button"
              className={`yt-library-nav-btn ${librarySection === 'playlists' ? 'active' : ''}`}
              onClick={() => setLibrarySection('playlists')}
            >
              <IconListPlus size={16} />
              <span>Playlists ({playlists.length})</span>
            </button>
            <button
              type="button"
              className={`yt-library-nav-btn ${librarySection === 'downloads' ? 'active' : ''}`}
              onClick={() => setLibrarySection('downloads')}
            >
              <IconDownload size={16} />
              <span>Offline Downloads ({offlineDownloads.length})</span>
            </button>
          </div>

          {/* Library Content Pane */}
          <div className="yt-library-content">
            {librarySection === 'history' ? (
              <div className="yt-lib-pane">
                <div className="yt-lib-pane-header">
                  <h2>Watch History</h2>
                  <button
                    type="button"
                    className="yt-lib-clear-btn"
                    onClick={() => { setWatchHistory([]); setNotice('Watch history cleared.') }}
                  >
                    Clear All History
                  </button>
                </div>
                {watchHistory.length === 0 ? (
                  <p className="yt-empty-text">No watched videos yet. Start browsing to populate your history.</p>
                ) : (
                  <div className="yt-lib-grid">
                    {watchHistory.map(item => {
                      const post = posts.find(p => p.id === item.postId)
                      if (!post) return null
                      return (
                        <div key={item.postId} className="yt-video-card" onClick={() => handleOpenWatchTheater(post)}>
                          <div className="yt-thumb-container">
                            <video src={getMediaUrl(post.video_url || '')} preload="metadata" />
                            <div className="yt-watch-progress-bar-wrap">
                              <div className="yt-watch-progress-fill" style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                          <div className="yt-card-meta">
                            <strong>{post.title}</strong>
                            <span>{post.community.name}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : librarySection === 'later' ? (
              <div className="yt-lib-pane">
                <div className="yt-lib-pane-header">
                  <h2>Watch Later Queue</h2>
                </div>
                {watchLaterIds.length === 0 ? (
                  <p className="yt-empty-text">Your Watch Later queue is empty. Click Save on any video to queue it.</p>
                ) : (
                  <div className="yt-lib-grid">
                    {watchLaterIds.map(id => {
                      const post = posts.find(p => p.id === id)
                      if (!post) return null
                      return (
                        <div key={id} className="yt-video-card" onClick={() => handleOpenWatchTheater(post)}>
                          <div className="yt-thumb-container">
                            <video src={getMediaUrl(post.video_url || '')} preload="metadata" />
                          </div>
                          <div className="yt-card-meta">
                            <strong>{post.title}</strong>
                            <span>{post.community.name}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : librarySection === 'downloads' ? (
              <div className="yt-lib-pane">
                <div className="yt-lib-pane-header">
                  <h2>Offline Downloads</h2>
                </div>
                {offlineDownloads.length === 0 ? (
                  <p className="yt-empty-text">No offline videos downloaded. Click Download on any video to save it locally.</p>
                ) : (
                  <div className="yt-offline-list">
                    {offlineDownloads.map(dl => (
                      <div key={dl.postId} className="yt-offline-item-card">
                        <div className="yt-offline-info">
                          <strong>{dl.title}</strong>
                          <small>Size: {dl.size} • Downloaded: {dl.date}</small>
                        </div>
                        <button
                          type="button"
                          className="yt-btn-play-offline"
                          onClick={() => {
                            const post = posts.find(p => p.id === dl.postId)
                            if (post) handleOpenWatchTheater(post)
                          }}
                        >
                          Play Offline
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="yt-lib-pane">
                <div className="yt-lib-pane-header">
                  <h2>{selectedPlaylistId ? `Playlist: ${playlists.find(p => p.id === selectedPlaylistId)?.name || 'Custom Playlist'}` : 'Custom Playlists'}</h2>
                  <div className="yt-lib-header-actions">
                    {selectedPlaylistId ? (
                      <>
                        <button
                          type="button"
                          className="yt-lib-clear-btn"
                          onClick={() => setSelectedPlaylistId(null)}
                        >
                          ← Back to All Playlists
                        </button>
                        <button
                          type="button"
                          className="yt-btn-primary"
                          onClick={() => {
                            const pl = playlists.find(p => p.id === selectedPlaylistId)
                            if (pl && pl.postIds.length > 0) {
                              const firstPost = posts.find(p => p.id === pl.postIds[0])
                              if (firstPost) handleOpenWatchTheater(firstPost)
                            } else {
                              setNotice('Playlist is currently empty.')
                            }
                          }}
                        >
                          <IconPlay size={14} fill />
                          <span>Play All</span>
                        </button>
                        <button
                          type="button"
                          className="yt-lib-delete-btn"
                          onClick={() => {
                            if (window.confirm('Delete this playlist?')) {
                              setPlaylists(prev => prev.filter(p => p.id !== selectedPlaylistId))
                              setSelectedPlaylistId(null)
                              setNotice('Playlist deleted.')
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="yt-btn-create-playlist"
                        onClick={() => setIsCreatePlaylistOpen(true)}
                      >
                        + New Playlist
                      </button>
                    )}
                  </div>
                </div>

                {selectedPlaylistId ? (
                  /* Single Playlist View with Reordering (Module 8) */
                  <div className="yt-playlist-detail-container">
                    {(() => {
                      const pl = playlists.find(p => p.id === selectedPlaylistId)
                      if (!pl || pl.postIds.length === 0) {
                        return (
                          <div className="yt-empty-text">
                            This playlist has no videos yet. Browse videos and click "Save to Playlist" to add content.
                          </div>
                        )
                      }
                      return (
                        <div className="yt-playlist-items-table">
                          {pl.postIds.map((pid, idx) => {
                            const pItem = posts.find(p => p.id === pid)
                            if (!pItem) return null
                            return (
                              <div key={pid} className="yt-playlist-reorder-row">
                                <span className="yt-reorder-rank">#{idx + 1}</span>
                                <div
                                  className="yt-reorder-thumb-wrap"
                                  onClick={() => handleOpenWatchTheater(pItem)}
                                >
                                  <video src={getMediaUrl(pItem.video_url || '')} preload="metadata" />
                                </div>
                                <div
                                  className="yt-reorder-info"
                                  onClick={() => handleOpenWatchTheater(pItem)}
                                >
                                  <strong>{pItem.title}</strong>
                                  <small>{pItem.community.name} • {formatViews(pItem.views_count || 0)} views</small>
                                </div>
                                <div className="yt-reorder-controls">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    className="yt-reorder-btn"
                                    onClick={() => handleMovePlaylistItem(pl.id, idx, 'up')}
                                    title="Move Up in Playlist"
                                  >
                                    <IconArrowUp size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === pl.postIds.length - 1}
                                    className="yt-reorder-btn"
                                    onClick={() => handleMovePlaylistItem(pl.id, idx, 'down')}
                                    title="Move Down in Playlist"
                                  >
                                    <IconArrowDown size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="yt-reorder-btn delete"
                                    onClick={() => handleRemovePlaylistItem(pl.id, pid)}
                                    title="Remove from Playlist"
                                  >
                                    <IconTrash size={15} />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="yt-playlists-list">
                    {playlists.length === 0 ? (
                      <p className="yt-empty-text">No playlists created yet. Create one to organize your videos.</p>
                    ) : (
                      playlists.map(pl => (
                        <div
                          key={pl.id}
                          className="yt-playlist-card"
                          onClick={() => setSelectedPlaylistId(pl.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <IconListPlus size={24} />
                          <strong>{pl.name}</strong>
                          <small>{pl.postIds.length} {pl.postIds.length === 1 ? 'video' : 'videos'}</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'studio' ? (
        /* =========================================================
           VIEW MODE 5: CREATOR STUDIO & ANALYTICS (Feature 5.1, 5.2, 5.3)
           ========================================================= */
        <div className="yt-studio-layout">
          {/* Studio Left Sidebar */}
          <aside className="yt-studio-sidebar">
            <div className="yt-studio-user-card">
              <UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.username} size={48} />
              <strong>{user.nickname || user.username}</strong>
              <small>Creator Studio</small>
            </div>

            <nav className="yt-studio-nav">
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setStudioTab('analytics')}
              >
                <IconSparkles size={16} />
                <span>Analytics</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'content' ? 'active' : ''}`}
                onClick={() => setStudioTab('content')}
              >
                <IconPlay size={16} />
                <span>Content</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'editor' ? 'active' : ''}`}
                onClick={() => setStudioTab('editor')}
              >
                <IconScissors size={16} />
                <span>Video Editor</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'branding' ? 'active' : ''}`}
                onClick={() => setStudioTab('branding')}
              >
                <IconSettings size={16} />
                <span>Customization</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'monetization' ? 'active' : ''}`}
                onClick={() => setStudioTab('monetization')}
              >
                <IconDollar size={16} />
                <span>Monetization</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'security' ? 'active' : ''}`}
                onClick={() => setStudioTab('security')}
              >
                <IconShieldCheck size={16} />
                <span>Security & Rights</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'copyright' ? 'active' : ''}`}
                onClick={() => setStudioTab('copyright')}
              >
                <IconCopyright size={16} />
                <span>Copyright & Claims</span>
              </button>
              <button
                type="button"
                className={`yt-studio-nav-btn ${studioTab === 'pipeline' ? 'active' : ''}`}
                onClick={() => setStudioTab('pipeline')}
              >
                <IconServer size={16} />
                <span>Media Pipeline</span>
              </button>
            </nav>
          </aside>

          {/* Studio Main Workspace */}
          <main className="yt-studio-main-workspace">
            {studioTab === 'analytics' ? (
              /* Creator Analytics Dashboard (Feature 5.2) */
              <div className="yt-studio-analytics-pane">
                <div className="yt-studio-pane-header">
                  <h2>Channel Analytics</h2>
                  <div className="yt-range-selector">
                    {(['7d', '28d', '90d'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`yt-range-btn ${analyticsRange === r ? 'active' : ''}`}
                        onClick={() => setAnalyticsRange(r)}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Metrics Cards */}
                <div className="yt-analytics-metrics-grid">
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Views</span>
                    <strong className="yt-metric-val">42.8K</strong>
                    <span className="yt-metric-change positive">↑ 18% vs previous period</span>
                  </div>
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Watch Time (Hours)</span>
                    <strong className="yt-metric-val">1,240.5</strong>
                    <span className="yt-metric-change positive">↑ 24% vs previous period</span>
                  </div>
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Subscribers</span>
                    <strong className="yt-metric-val">+348</strong>
                    <span className="yt-metric-change positive">↑ 12% vs previous period</span>
                  </div>
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Estimated Revenue</span>
                    <strong className="yt-metric-val">$184.50</strong>
                    <span className="yt-metric-change positive">↑ 8% vs previous period</span>
                  </div>
                </div>

                {/* Retention Curve & Views Graph (SVG Charts) */}
                <div className="yt-analytics-charts-row">
                  <div className="yt-chart-box">
                    <h3>Audience Retention Curve (Avg: 68%)</h3>
                    <div className="yt-svg-chart-wrap">
                      <svg viewBox="0 0 500 150" className="yt-analytics-svg">
                        <defs>
                          <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 20 Q 100 45, 200 55 T 400 70 T 500 85 L 500 150 L 0 150 Z"
                          fill="url(#retGrad)"
                        />
                        <path
                          d="M 0 20 Q 100 45, 200 55 T 400 70 T 500 85"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="yt-chart-box">
                    <h3>Views Over Time</h3>
                    <div className="yt-svg-chart-wrap">
                      <svg viewBox="0 0 500 150" className="yt-analytics-svg">
                        <defs>
                          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 130 C 80 110, 160 30, 240 60 C 320 90, 400 20, 500 40 L 500 150 L 0 150 Z"
                          fill="url(#viewsGrad)"
                        />
                        <path
                          d="M 0 130 C 80 110, 160 30, 240 60 C 320 90, 400 20, 500 40"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : studioTab === 'editor' ? (
              /* Basic In-Browser Video Editor (Feature 5.3) */
              <div className="yt-studio-editor-pane">
                <div className="yt-studio-pane-header">
                  <h2>In-Browser Video Trimmer & Enhancer</h2>
                  <button
                    type="button"
                    className="yt-btn-upload-primary"
                    onClick={() => { setNotice('Trimmed video rendered successfully! 🎬'); setTimeout(() => setNotice(''), 3000) }}
                  >
                    Save Changes
                  </button>
                </div>

                <div className="yt-editor-timeline-card">
                  <div className="yt-editor-scrub-bar">
                    <div
                      className="yt-editor-trim-highlight"
                      style={{ left: `${(editorTrimStart / 100) * 100}%`, right: `${100 - (editorTrimEnd / 100) * 100}%` }}
                    />
                  </div>
                  <div className="yt-editor-time-controls">
                    <div>
                      <label>In-Point (Start):</label>
                      <input
                        type="number"
                        value={editorTrimStart}
                        onChange={e => setEditorTrimStart(Number(e.target.value))}
                        className="yt-editor-num-input"
                      />
                      <span>sec</span>
                    </div>
                    <div>
                      <label>Out-Point (End):</label>
                      <input
                        type="number"
                        value={editorTrimEnd}
                        onChange={e => setEditorTrimEnd(Number(e.target.value))}
                        className="yt-editor-num-input"
                      />
                      <span>sec</span>
                    </div>
                  </div>
                </div>

                <div className="yt-editor-options-grid">
                  <div className="yt-editor-opt-box">
                    <strong>Audio Track Replacement</strong>
                    <select
                      value={editorAudioTrack}
                      onChange={e => setEditorAudioTrack(e.target.value)}
                      className="yt-editor-select"
                    >
                      <option value="original">Original Audio (Default)</option>
                      <option value="lofi">Lo-Fi Beats (Royalty Free)</option>
                      <option value="ambient">Cinematic Ambient (Royalty Free)</option>
                      <option value="upbeat">Upbeat Electronic (Royalty Free)</option>
                    </select>
                  </div>

                  <div className="yt-editor-opt-box">
                    <strong>End Screen Cards</strong>
                    <label className="yt-editor-toggle-label">
                      <input
                        type="checkbox"
                        checked={editorEndScreen}
                        onChange={e => setEditorEndScreen(e.target.checked)}
                      />
                      <span>Show Subscribe & Best Video End Screen</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : studioTab === 'monetization' ? (
              /* Monetization & Super Chat Management (Feature 7.2 & 7.3) */
              <div className="yt-studio-monetization-pane">
                <div className="yt-studio-pane-header">
                  <h2>Channel Monetization & Super Thanks</h2>
                </div>
                <div className="yt-analytics-metrics-grid">
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Total Revenue</span>
                    <strong className="yt-metric-val">$1,482.00</strong>
                  </div>
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Active Memberships</span>
                    <strong className="yt-metric-val">42 Members</strong>
                  </div>
                  <div className="yt-metric-card">
                    <span className="yt-metric-title">Super Chat Tips</span>
                    <strong className="yt-metric-val">$320.00</strong>
                  </div>
                </div>
              </div>
            ) : studioTab === 'security' ? (
              /* Security & Copyright Checks (Feature 8.1, 8.2, 8.3) */
              <div className="yt-studio-security-pane">
                <div className="yt-studio-pane-header">
                  <h2>Copyright & Content Safety Checks</h2>
                </div>
                <div className="yt-security-card">
                  <IconShieldCheck size={28} />
                  <div>
                    <strong>Content ID & Audio Fingerprint Status</strong>
                    <p>All published videos are scanned with Gather Content ID and audio fingerprinting technology.</p>
                  </div>
                  <span className="yt-security-status-pill green">100% Clean</span>
                </div>
              </div>
            ) : studioTab === 'copyright' ? (
              /* Content ID & Claims Management (Module 13: Copyright) */
              <div className="yt-studio-copyright-pane">
                <div className="yt-studio-pane-header">
                  <h2>Content ID & Rights Management</h2>
                  <span className="yt-security-status-pill green">Active Content ID Protection</span>
                </div>
                <p className="yt-studio-subtitle">
                  Review automated audio and video fingerprint matches detected across your channel uploads.
                  You can file a formal dispute if you hold commercial rights or fair use.
                </p>

                <div className="yt-claims-table-wrap">
                  <table className="yt-studio-table">
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Video Title</th>
                        <th>Detected Match</th>
                        <th>Claimant / Rights Holder</th>
                        <th>Policy</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>CLM-84920</code></td>
                        <td><strong>Building Modern Scalable Microservices</strong></td>
                        <td>Background Audio Track (1:45 - 2:12)</td>
                        <td>StudioSound Records Inc.</td>
                        <td><span className="yt-policy-pill monetize">Monetize by claimant</span></td>
                        <td><span className="yt-claim-status-pill active">Active Claim</span></td>
                        <td>
                          <button
                            type="button"
                            className="yt-btn-dispute-claim"
                            onClick={() => {
                              setDisputeClaimId('CLM-84920')
                              setIsDisputeModalOpen(true)
                            }}
                          >
                            Dispute Claim
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td><code>CLM-77142</code></td>
                        <td><strong>Gather Streaming Engine Deep Dive</strong></td>
                        <td>Visual B-Roll segment (0:10 - 0:25)</td>
                        <td>TechGraphics Media</td>
                        <td><span className="yt-policy-pill track">Track views</span></td>
                        <td><span className="yt-claim-status-pill clean">Resolved</span></td>
                        <td>
                          <button
                            type="button"
                            className="yt-btn-dispute-claim"
                            onClick={() => {
                              setDisputeClaimId('CLM-77142')
                              setIsDisputeModalOpen(true)
                            }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td><code>CLM-55201</code></td>
                        <td><strong>4K Benchmark & HLS Player Test</strong></td>
                        <td>None (Original composition)</td>
                        <td>Gather Creator Studio</td>
                        <td><span className="yt-policy-pill creator">Monetized by creator</span></td>
                        <td><span className="yt-claim-status-pill clean">100% Original</span></td>
                        <td>
                          <span className="yt-claim-clean-tag">✓ Protected</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : studioTab === 'pipeline' ? (
              /* Dedicated Media Pipeline & Transcoding Architecture (Image 2) */
              <div className="yt-studio-pipeline-pane">
                <div className="yt-studio-pane-header">
                  <div>
                    <h2>Dedicated Media Pipeline & Video Streaming Engine</h2>
                    <small>YouTube-grade automated multi-bitrate packaging, queue distribution & global edge delivery</small>
                  </div>
                  <span className="yt-security-status-pill green">● Engine Online • 14ms Latency</span>
                </div>

                {/* Pipeline Real-time Metrics */}
                <div className="yt-pipeline-kpi-grid">
                  <div className="yt-pipeline-kpi-card">
                    <IconUploadCloud size={20} />
                    <div>
                      <small>Resumable Ingest Queue</small>
                      <strong>3 Uploads in Flight</strong>
                    </div>
                  </div>
                  <div className="yt-pipeline-kpi-card">
                    <IconCpu size={20} />
                    <div>
                      <small>Transcoding Workers</small>
                      <strong>6 NVENC / QuickSync Nodes</strong>
                    </div>
                  </div>
                  <div className="yt-pipeline-kpi-card">
                    <IconFileText size={20} />
                    <div>
                      <small>HLS / DASH Packaging</small>
                      <strong>4K, 1080p, 720p, 480p, 360p, 240p</strong>
                    </div>
                  </div>
                  <div className="yt-pipeline-kpi-card">
                    <IconServer size={20} />
                    <div>
                      <small>Storage & CDN Cache</small>
                      <strong>98.6% Hit Ratio • 42 Edge POPs</strong>
                    </div>
                  </div>
                </div>

                {/* 6 Stage Pipeline Architecture Cards (Image 2) */}
                <div className="yt-pipeline-stages-container">
                  <div className="yt-pipeline-stage-step">
                    <div className="yt-stage-num-badge">Stage 1</div>
                    <div className="yt-stage-card">
                      <div className="yt-stage-header">
                        <h4>1. Video Upload</h4>
                        <span className="yt-stage-tag active">Active Ingest</span>
                      </div>
                      <p>Resumable chunked upload protocol (5MB blocks), SHA-256 data integrity validation, container validation and metadata extraction.</p>
                      <div className="yt-stage-specs">
                        <span>• Chunk protocol: Resumable HTTP/2</span>
                        <span>• Supported: MP4, MOV, WebM, MKV</span>
                        <span>• Max Resolution: 4K (3840x2160@60fps)</span>
                      </div>
                    </div>
                  </div>

                  <div className="yt-pipeline-stage-arrow">↓</div>

                  <div className="yt-pipeline-stage-step">
                    <div className="yt-stage-num-badge">Stage 2</div>
                    <div className="yt-stage-card">
                      <div className="yt-stage-header">
                        <h4>2. Processing Queue</h4>
                        <span className="yt-stage-tag active">Redis / Celery</span>
                      </div>
                      <p>Distributed asynchronous background jobs, task serialization, job prioritization, auto-scaling worker nodes and dead-letter queue recovery.</p>
                      <div className="yt-stage-specs">
                        <span>• Queue broker: Redis Distributed Clusters</span>
                        <span>• Queue latency: 120ms</span>
                        <span>• Auto-scaler: 2 to 32 worker pods</span>
                      </div>
                    </div>
                  </div>

                  <div className="yt-pipeline-stage-arrow">↓</div>

                  <div className="yt-pipeline-stage-step">
                    <div className="yt-stage-num-badge">Stage 3</div>
                    <div className="yt-stage-card">
                      <div className="yt-stage-header">
                        <h4>3. Transcoding Engine</h4>
                        <span className="yt-stage-tag active">Hardware Accelerated</span>
                      </div>
                      <p>Multi-resolution video rendition ladder generation with hardware acceleration (NVIDIA NVENC & Intel QuickSync). Dual-pass constrained VBR encoding.</p>
                      <div className="yt-transcode-ladder-grid">
                        <span className="yt-ladder-pill">4K UHD (2160p @ 18Mbps)</span>
                        <span className="yt-ladder-pill">1080p FHD (1080p @ 6Mbps)</span>
                        <span className="yt-ladder-pill">720p HD (720p @ 3.2Mbps)</span>
                        <span className="yt-ladder-pill">480p SD (480p @ 1.4Mbps)</span>
                        <span className="yt-ladder-pill">360p Mobile (360p @ 750kbps)</span>
                        <span className="yt-ladder-pill">240p Lite (240p @ 350kbps)</span>
                      </div>
                      <div className="yt-stage-specs">
                        <span>• Codecs: H.264/AVC, H.265/HEVC, AV1</span>
                        <span>• Audio: AAC-LC 128kbps / Opus 96kbps</span>
                      </div>
                    </div>
                  </div>

                  <div className="yt-pipeline-stage-arrow">↓</div>

                  <div className="yt-pipeline-stage-step">
                    <div className="yt-stage-num-badge">Stage 4</div>
                    <div className="yt-stage-card">
                      <div className="yt-stage-header">
                        <h4>4. Media Packaging</h4>
                        <span className="yt-stage-tag active">HLS & MPEG-DASH</span>
                      </div>
                      <p>Adaptive streaming packaging: HLS master playlist (.m3u8), MPEG-DASH manifest (.mpd), WebVTT closed captions in English/Bengali/Spanish, and seek scrubbing sprite sheet thumbnails.</p>
                      <div className="yt-stage-specs">
                        <span>• Segments: 4-second TS / fMP4 chunks</span>
                        <span>• WebVTT captions: Multi-lingual tracks</span>
                        <span>• Sprite thumbnails: 100-frame storyboard</span>
                      </div>
                    </div>
                  </div>

                  <div className="yt-pipeline-stage-arrow">↓</div>

                  <div className="yt-pipeline-stage-step">
                    <div className="yt-stage-num-badge">Stage 5</div>
                    <div className="yt-stage-card">
                      <div className="yt-stage-header">
                        <h4>5. Storage + Edge CDN</h4>
                        <span className="yt-stage-tag active">Multi-AZ Edge</span>
                      </div>
                      <p>Redundant object storage with multi-region replication. High-speed content delivery network edge POPs with intelligent geographic caching.</p>
                      <div className="yt-stage-specs">
                        <span>• Cache Hit Ratio: 98.6%</span>
                        <span>• Average Edge Latency: 14ms</span>
                        <span>• Point of Presence: 42 global edge clusters</span>
                      </div>
                    </div>
                  </div>

                  <div className="yt-pipeline-stage-arrow">↓</div>

                  <div className="yt-pipeline-stage-step">
                    <div className="yt-stage-num-badge">Stage 6</div>
                    <div className="yt-stage-card">
                      <div className="yt-stage-header">
                        <h4>6. Video Player Engine</h4>
                        <span className="yt-stage-tag active">Adaptive Client</span>
                      </div>
                      <p>Client-side HTML5 MSE player with dynamic throughput estimation, buffer health telemetry, Stats for Nerds, quality switching from 240p to 4K, and interactive transcripts.</p>
                      <div className="yt-stage-specs">
                        <span>• Adaptive Bitrate: Bandwidth-aware switching</span>
                        <span>• Telemetry: Real-time buffer and dropped frame monitor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Content List (Module 3: Video Edit & Delete) */
              <div className="yt-studio-content-pane">
                <div className="yt-studio-pane-header">
                  <h2>Channel Content</h2>
                  <button
                    type="button"
                    className="yt-btn-upload-primary"
                    onClick={() => setIsUploadVideoModal(true)}
                  >
                    + Upload Video
                  </button>
                </div>
                <div className="yt-studio-table-wrap">
                  <table className="yt-studio-table">
                    <thead>
                      <tr>
                        <th>Video</th>
                        <th>Visibility</th>
                        <th>Date</th>
                        <th>Views</th>
                        <th>Likes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(post => (
                        <tr key={post.id}>
                          <td>
                            <div className="yt-table-video-cell">
                              <video src={getMediaUrl(post.video_url || '')} preload="metadata" />
                              <div>
                                <strong>{post.title}</strong>
                                <small>{post.community.name}</small>
                              </div>
                            </div>
                          </td>
                          <td><span className="yt-table-vis-pill">Public</span></td>
                          <td>{new Date(post.created_at).toLocaleDateString()}</td>
                          <td>{formatViews(post.views_count || 0)}</td>
                          <td>{post.upvote_count}</td>
                          <td>
                            <div className="yt-table-actions-cell">
                              <button
                                type="button"
                                className="yt-table-act-btn edit"
                                onClick={() => {
                                  setEditingPost(post)
                                  setEditTitle(post.title)
                                  setEditContent(post.content || '')
                                  setEditCategory(post.community.category || 'Tech & Gadgets')
                                  setEditVisibility('public')
                                }}
                                title="Edit Video Details"
                              >
                                <IconEdit size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="yt-table-act-btn delete"
                                onClick={() => handleDeletePost(post.id)}
                                title="Delete Video"
                              >
                                <IconTrash size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : activeTab === 'channel' ? (
        /* =========================================================
           VIEW MODE 5.5: CHANNEL PROFILE VIEW (Module 2: Channel)
           ========================================================= */
        <div className="yt-channel-page-layout">
          {(() => {
            const currentSlug = selectedChannelSlug || (pages[0]?.slug || posts[0]?.community.slug)
            const channelComm = pages.find(p => p.slug === currentSlug) || posts.find(p => p.community.slug === currentSlug)?.community
            const channelPosts = posts.filter(p => p.community.slug === currentSlug)
            const isSubscribed = currentSlug ? !!subscribedSlugs[currentSlug] : false

            return (
              <div className="yt-channel-page-content">
                {/* Channel Banner */}
                <div className="yt-channel-banner">
                  <div className="yt-channel-banner-overlay">
                    <span className="yt-banner-badge">Gather Official Creator Channel</span>
                  </div>
                </div>

                {/* Channel Header Profile Meta */}
                <div className="yt-channel-header-row">
                  <div className="yt-channel-avatar-xlarge">
                    {(channelComm?.name || currentSlug || 'C')[0].toUpperCase()}
                  </div>
                  <div className="yt-channel-main-info">
                    <div className="yt-channel-title-row">
                      <h1>{channelComm?.name || currentSlug}</h1>
                      <span className="yt-verified-badge" title="Verified Creator">✓ Verified Creator</span>
                    </div>
                    <div className="yt-channel-meta-stats">
                      <span>@{currentSlug}</span>
                      <span>•</span>
                      <span>{channelComm?.member_count || 1} {(channelComm?.member_count || 1) === 1 ? 'subscriber' : 'subscribers'}</span>
                      <span>•</span>
                      <span>{channelPosts.length} videos</span>
                    </div>
                    <p className="yt-channel-bio">
                      {channelComm?.description || 'Welcome to the official video channel on Gather Watch! Exploring cutting-edge streaming, technology, and engineering.'}
                    </p>

                    <div className="yt-channel-action-row">
                      <button
                        type="button"
                        className={`yt-btn-subscribe ${isSubscribed ? 'subscribed' : ''}`}
                        onClick={() => currentSlug && handleToggleSubscribe(currentSlug)}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                      <button
                        type="button"
                        className="yt-btn-join-membership"
                        onClick={() => setIsMembershipModalOpen(true)}
                      >
                        Join
                      </button>
                      <button
                        type="button"
                        className="yt-btn-secondary"
                        onClick={() => setIsOpenPageModal(true)}
                      >
                        + Create Channel
                      </button>
                    </div>
                  </div>

                  {/* Channel Switcher */}
                  <div className="yt-channel-selector-box">
                    <label>Browse Channels:</label>
                    <select
                      value={currentSlug || ''}
                      onChange={e => setSelectedChannelSlug(e.target.value)}
                      className="yt-channel-select-dropdown"
                    >
                      {Array.from(new Set(posts.map(p => p.community.slug))).map(slug => {
                        const name = posts.find(p => p.community.slug === slug)?.community.name || slug
                        return (
                          <option key={slug} value={slug}>{name} (@{slug})</option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                {/* Channel Navigation Sub-tabs */}
                <div className="yt-channel-subtabs">
                  <button
                    type="button"
                    className={`yt-subtab-btn ${channelTab === 'home' ? 'active' : ''}`}
                    onClick={() => setChannelTab('home')}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    className={`yt-subtab-btn ${channelTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setChannelTab('videos')}
                  >
                    Videos ({channelPosts.length})
                  </button>
                  <button
                    type="button"
                    className={`yt-subtab-btn ${channelTab === 'shorts' ? 'active' : ''}`}
                    onClick={() => setChannelTab('shorts')}
                  >
                    Shorts
                  </button>
                  <button
                    type="button"
                    className={`yt-subtab-btn ${channelTab === 'playlists' ? 'active' : ''}`}
                    onClick={() => setChannelTab('playlists')}
                  >
                    Playlists
                  </button>
                  <button
                    type="button"
                    className={`yt-subtab-btn ${channelTab === 'about' ? 'active' : ''}`}
                    onClick={() => setChannelTab('about')}
                  >
                    About
                  </button>
                </div>

                {/* Subtab Content */}
                <div className="yt-channel-tab-body">
                  {channelTab === 'about' ? (
                    <div className="yt-channel-about-card">
                      <h3>About {channelComm?.name || currentSlug}</h3>
                      <p>{channelComm?.description || 'Official video broadcast channel on Gather Watch. Sharing high quality guides and live streams.'}</p>
                      <hr className="yt-divider" />
                      <div className="yt-about-stats-list">
                        <div><strong>Category:</strong> <span>{channelComm?.category || 'Tech & Gadgets'}</span></div>
                        <div><strong>Channel ID:</strong> <code>{channelComm?.id || 'comm-1'}</code></div>
                        <div><strong>Total Channel Views:</strong> <span>{formatViews(channelPosts.reduce((acc, p) => acc + (p.views_count || 0), 0))}</span></div>
                        <div><strong>Joined:</strong> <span>November 2026</span></div>
                        <div><strong>Content ID Protection:</strong> <span className="yt-security-status-pill green">Verified & Active</span></div>
                      </div>
                    </div>
                  ) : channelTab === 'playlists' ? (
                    <div className="yt-channel-playlists-grid">
                      {playlists.map(pl => (
                        <div
                          key={pl.id}
                          className="yt-playlist-card"
                          onClick={() => {
                            setSelectedPlaylistId(pl.id)
                            setLibrarySection('playlists')
                            setActiveTab('library')
                          }}
                        >
                          <IconListPlus size={24} />
                          <strong>{pl.name}</strong>
                          <small>{pl.postIds.length} videos</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="yt-channel-videos-grid">
                      {channelPosts.length === 0 ? (
                        <p className="yt-empty-text">This channel has not uploaded any videos yet.</p>
                      ) : (
                        channelPosts.map(post => (
                          <div
                            key={post.id}
                            className="yt-video-card"
                            onClick={() => handleOpenWatchTheater(post)}
                          >
                            <div className="yt-thumb-container">
                              <video src={getMediaUrl(post.video_url || '')} preload="metadata" />
                              <div className="yt-thumb-duration-pill">4:12</div>
                            </div>
                            <div className="yt-card-meta-row">
                              <div className="yt-card-text-col">
                                <h3 className="yt-card-video-title">{post.title}</h3>
                                <div className="yt-card-stats-line">
                                  <span>{formatViews(post.views_count || 0)}</span>
                                  <span>•</span>
                                  <span>{formatRelativeTime(post.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      ) : (
        /* =========================================================
           VIEW MODE 6: BROWSE FEED (ALL VIDEOS, CATEGORIES, TRENDING)
           ========================================================= */
        <div className="yt-browse-feed-layout">
          {/* Category Chips Bar */}
          <div className="yt-categories-scroll-bar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`yt-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'Trending' ? '🔥 Trending' : cat}
              </button>
            ))}
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="yt-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="yt-skeleton-card" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="yt-empty-feed-card">
              <IconPlay size={44} />
              <h3>No videos found in this category</h3>
              <p>Be the first one to upload a video or explore trending topics!</p>
              <button
                type="button"
                className="yt-btn-upload-primary"
                onClick={() => setIsUploadVideoModal(true)}
              >
                Upload Video
              </button>
            </div>
          ) : (
            <div className="yt-videos-grid">
              {filteredPosts.map((post, idx) => {
                const isTrending = selectedCategory === 'Trending' || idx < 3
                return (
                  <article
                    key={post.id}
                    className="yt-video-grid-card"
                    onClick={() => handleOpenWatchTheater(post)}
                  >
                    {/* Thumbnail Frame with Duration & Hover Preview (Feature 1.4) */}
                    <div className="yt-thumb-container">
                      <video
                        src={getMediaUrl(post.video_url || '')}
                        preload="metadata"
                        className="yt-thumb-video"
                        onMouseEnter={e => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={e => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        }}
                      />
                      <span className="yt-thumb-duration-pill">08:45</span>
                      {isTrending && (
                        <span className="yt-trending-rank-badge">#{idx + 1} ON TRENDING</span>
                      )}
                    </div>

                    {/* Metadata: Channel Avatar, Title, Views, Time */}
                    <div className="yt-card-meta-row">
                      <div className="yt-channel-avatar-circle small">
                        {(post.community.name || post.community.slug)[0].toUpperCase()}
                      </div>
                      <div className="yt-card-text-col">
                        <h3 className="yt-card-video-title">{post.title}</h3>
                        <span className="yt-card-channel-name">{post.community.name}</span>
                        <div className="yt-card-stats-line">
                          <span>{formatViews(post.views_count || 0)}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL 1: RESUMABLE CHUNKED UPLOAD WIZARD (Feature 2.1, 2.4, 8.2, 8.3)
          ========================================================= */}
      {isUploadVideoModal && (
        <div className="yt-modal-backdrop" onClick={() => setIsUploadVideoModal(false)}>
          <div className="yt-modal-card upload-wizard" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title-text">
                <h3>Upload Video to Channel</h3>
                <small>Step {uploadStep} of 4 • Multi-bitrate HLS Transcoding & Rights Check</small>
              </div>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsUploadVideoModal(false)}>✕</button>
            </div>

            {uploadError && <div className="yt-modal-error-alert">{uploadError}</div>}

            <div className="yt-upload-steps-indicator">
              <span className={`yt-step-dot ${uploadStep >= 1 ? 'active' : ''}`}>1. Details</span>
              <span className={`yt-step-dot ${uploadStep >= 2 ? 'active' : ''}`}>2. Elements</span>
              <span className={`yt-step-dot ${uploadStep >= 3 ? 'active' : ''}`}>3. Checks</span>
              <span className={`yt-step-dot ${uploadStep >= 4 ? 'active' : ''}`}>4. Publish</span>
            </div>

            {uploadStep === 1 ? (
              /* Step 1: Details */
              <div className="yt-upload-step-content">
                {/* Drag and Drop Video Box */}
                <div
                  className={`yt-drop-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setIsDragging(false)
                    if (e.dataTransfer.files[0]) {
                      setSelectedVideoFile(e.dataTransfer.files[0])
                      setVideoPreviewUrl(URL.createObjectURL(e.dataTransfer.files[0]))
                    }
                  }}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <IconUploadCloud size={36} />
                  <strong>{selectedVideoFile ? selectedVideoFile.name : 'Drag & drop video file to upload'}</strong>
                  <small>MP4, WebM, or MOV up to 4K resolution</small>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        setSelectedVideoFile(e.target.files[0])
                        setVideoPreviewUrl(URL.createObjectURL(e.target.files[0]))
                      }
                    }}
                  />
                </div>

                <div className="yt-form-group">
                  <label>Title (Required)</label>
                  <input
                    type="text"
                    placeholder="Add a title that describes your video"
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    className="yt-form-input"
                  />
                </div>

                <div className="yt-form-group">
                  <label>Channel</label>
                  <select
                    value={uploadTargetSlug}
                    onChange={e => setUploadTargetSlug(e.target.value)}
                    className="yt-form-select"
                  >
                    {pages.map(p => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="yt-form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Tell viewers about your video"
                    value={videoDescription}
                    onChange={e => setVideoDescription(e.target.value)}
                    className="yt-form-textarea"
                  />
                </div>

                <div className="yt-modal-footer">
                  <button type="button" className="yt-btn-secondary" onClick={() => setIsUploadVideoModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="yt-btn-primary"
                    disabled={!selectedVideoFile || !videoTitle.trim()}
                    onClick={() => setUploadStep(2)}
                  >
                    Next: Elements ➔
                  </button>
                </div>
              </div>
            ) : uploadStep === 2 ? (
              /* Step 2: Elements */
              <div className="yt-upload-step-content">
                <div className="yt-step-card">
                  <strong>Auto-Generated Subtitles (WebVTT)</strong>
                  <p>English, Bengali, and Spanish tracks will be generated automatically.</p>
                  <span className="yt-badge-ready">✓ Ready</span>
                </div>
                <div className="yt-step-card">
                  <strong>End Screen Video Cards</strong>
                  <p>Encourage viewers to subscribe and watch next clip.</p>
                  <span className="yt-badge-ready">✓ Enabled</span>
                </div>
                <div className="yt-modal-footer">
                  <button type="button" className="yt-btn-secondary" onClick={() => setUploadStep(1)}>
                    Back
                  </button>
                  <button type="button" className="yt-btn-primary" onClick={() => setUploadStep(3)}>
                    Next: Rights & Safety Checks ➔
                  </button>
                </div>
              </div>
            ) : uploadStep === 3 ? (
              /* Step 3: Checks (Feature 8.2 & 8.3) */
              <div className="yt-upload-step-content">
                <div className="yt-step-card">
                  <IconShieldCheck size={20} />
                  <div>
                    <strong>Automated Content Moderation (Safety Scan)</strong>
                    <small>NSFW filter: Safe • Violence scan: Safe • Hate speech: None</small>
                  </div>
                  <span className="yt-badge-ready">Passed</span>
                </div>
                <div className="yt-step-card">
                  <IconShieldCheck size={20} />
                  <div>
                    <strong>Copyright & Audio Fingerprint (Content ID)</strong>
                    <small>Zero matches in copyright audio/video database</small>
                  </div>
                  <span className="yt-badge-ready">No Claims</span>
                </div>
                <div className="yt-modal-footer">
                  <button type="button" className="yt-btn-secondary" onClick={() => setUploadStep(2)}>
                    Back
                  </button>
                  <button type="button" className="yt-btn-primary" onClick={() => setUploadStep(4)}>
                    Next: Visibility & Upload ➔
                  </button>
                </div>
              </div>
            ) : (
              /* Step 4: Chunked Upload Progress & Visibility (Feature 2.1 & 2.4) */
              <div className="yt-upload-step-content">
                <div className="yt-visibility-options">
                  <label className="yt-radio-label">
                    <input
                      type="radio"
                      name="vis"
                      value="public"
                      checked={videoVisibility === 'public'}
                      onChange={() => setVideoVisibility('public')}
                    />
                    <div>
                      <strong>Public</strong>
                      <small>Everyone can watch your video</small>
                    </div>
                  </label>
                  <label className="yt-radio-label">
                    <input
                      type="radio"
                      name="vis"
                      value="unlisted"
                      checked={videoVisibility === 'unlisted'}
                      onChange={() => setVideoVisibility('unlisted')}
                    />
                    <div>
                      <strong>Unlisted</strong>
                      <small>Anyone with the video link can watch</small>
                    </div>
                  </label>
                  <label className="yt-radio-label">
                    <input
                      type="radio"
                      name="vis"
                      value="private"
                      checked={videoVisibility === 'private'}
                      onChange={() => setVideoVisibility('private')}
                    />
                    <div>
                      <strong>Private</strong>
                      <small>Only you can watch</small>
                    </div>
                  </label>
                </div>

                {uploadingVideo && (
                  <div className="yt-chunk-upload-status">
                    <div className="yt-chunk-progress-header">
                      <span>Chunked Resumable Uploading: {chunkUploadProgress}%</span>
                      <button
                        type="button"
                        className="yt-btn-pause-upload"
                        onClick={() => setIsUploadPaused(!isUploadPaused)}
                      >
                        {isUploadPaused ? 'Resume Upload' : 'Pause Upload'}
                      </button>
                    </div>
                    <div className="yt-chunk-bar-track">
                      <div className="yt-chunk-bar-fill" style={{ width: `${chunkUploadProgress}%` }} />
                    </div>
                    <small>Multi-part upload in progress (Simulated flaky network resilience)</small>
                  </div>
                )}

                <div className="yt-modal-footer">
                  <button
                    type="button"
                    className="yt-btn-secondary"
                    disabled={uploadingVideo}
                    onClick={() => setUploadStep(3)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="yt-btn-primary"
                    disabled={uploadingVideo}
                    onClick={handleStartChunkedUpload}
                  >
                    {uploadingVideo ? 'Transcoding & Uploading...' : 'Publish Video'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: GO LIVE BROADCAST MODAL (Feature 6.1)
          ========================================================= */}
      {isLiveModalOpen && (
        <div className="yt-modal-backdrop" onClick={() => setIsLiveModalOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Start Live Stream</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsLiveModalOpen(false)}>✕</button>
            </div>
            <div className="yt-form-group">
              <label>Stream Title</label>
              <input
                type="text"
                placeholder="What is your live stream about?"
                value={liveStreamTitle}
                onChange={e => setLiveStreamTitle(e.target.value)}
                className="yt-form-input"
              />
            </div>
            <div className="yt-form-group">
              <label>Broadcasting Ingest Source</label>
              <div className="yt-ingest-selector">
                <button
                  type="button"
                  className={`yt-ingest-choice ${liveIngestType === 'camera' ? 'active' : ''}`}
                  onClick={() => setLiveIngestType('camera')}
                >
                  Webcam & Microphone
                </button>
                <button
                  type="button"
                  className={`yt-ingest-choice ${liveIngestType === 'rtmp' ? 'active' : ''}`}
                  onClick={() => setLiveIngestType('rtmp')}
                >
                  OBS / Streaming Software
                </button>
              </div>
            </div>
            {liveIngestType === 'rtmp' && (
              <div className="yt-rtmp-info-card">
                <div><strong>Server URL:</strong> <code>rtmp://live.gather.tv/app</code></div>
                <div><strong>Stream Key:</strong> <code>live_key_982431792_secret</code></div>
              </div>
            )}
            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsLiveModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="yt-btn-primary red"
                onClick={() => {
                  setIsLiveModalOpen(false)
                  setActiveTab('live')
                  setIsBroadcasting(true)
                  setNotice('You are now LIVE on Gather Watch! 🔴')
                  setTimeout(() => setNotice(''), 3000)
                }}
              >
                Go Live Now ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: SUPER THANKS / DONATION DIALOG (Feature 7.3)
          ========================================================= */}
      {isSuperThanksOpen && (
        <div className="yt-modal-backdrop" onClick={() => setIsSuperThanksOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Support Creator with Super Thanks</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsSuperThanksOpen(false)}>✕</button>
            </div>
            <p>Your contribution directly supports the channel and pins your highlighted message in the comments.</p>
            <div className="yt-super-amounts-row">
              {['2', '5', '10', '50'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  className={`yt-amount-pill ${superThanksAmount === amt ? 'active' : ''}`}
                  onClick={() => setSuperThanksAmount(amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <div className="yt-form-group">
              <label>Your Message (Optional)</label>
              <input
                type="text"
                placeholder="Great video! Keep up the good work..."
                value={superThanksMessage}
                onChange={e => setSuperThanksMessage(e.target.value)}
                className="yt-form-input"
              />
            </div>
            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsSuperThanksOpen(false)}>
                Cancel
              </button>
              <button type="button" className="yt-btn-primary green" onClick={handleSendSuperThanks}>
                Send ${superThanksAmount} Super Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: CHANNEL MEMBERSHIP TIERS (Feature 7.2)
          ========================================================= */}
      {isMembershipModalOpen && (
        <div className="yt-modal-backdrop" onClick={() => setIsMembershipModalOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Join Channel Membership</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsMembershipModalOpen(false)}>✕</button>
            </div>
            <div className="yt-membership-tiers-grid">
              <div
                className={`yt-tier-card ${membershipTier === 'bronze' ? 'selected' : ''}`}
                onClick={() => setMembershipTier('bronze')}
              >
                <h4>Bronze Supporter</h4>
                <div className="yt-tier-price">$1.99 / month</div>
                <ul>
                  <li>✓ Loyalty badges by your name</li>
                  <li>✓ Custom channel emojis</li>
                </ul>
              </div>
              <div
                className={`yt-tier-card ${membershipTier === 'silver' ? 'selected' : ''}`}
                onClick={() => setMembershipTier('silver')}
              >
                <h4>Silver Insider</h4>
                <div className="yt-tier-price">$4.99 / month</div>
                <ul>
                  <li>✓ All Bronze perks</li>
                  <li>✓ Early access to new videos</li>
                  <li>✓ Members-only live chats</li>
                </ul>
              </div>
              <div
                className={`yt-tier-card ${membershipTier === 'gold' ? 'selected' : ''}`}
                onClick={() => setMembershipTier('gold')}
              >
                <h4>Gold VIP</h4>
                <div className="yt-tier-price">$9.99 / month</div>
                <ul>
                  <li>✓ All Silver perks</li>
                  <li>✓ Direct monthly Q&A</li>
                  <li>✓ Video credits shout-out</li>
                </ul>
              </div>
            </div>
            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsMembershipModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="yt-btn-primary"
                onClick={() => {
                  setIsMembershipModalOpen(false)
                  setNotice(`Welcome! You are now a ${membershipTier.toUpperCase()} member! 🎖️`)
                  setTimeout(() => setNotice(''), 3000)
                }}
              >
                Join as {membershipTier.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: CREATE PLAYLIST MODAL (Feature 4.4)
          ========================================================= */}
      {isCreatePlaylistOpen && (
        <div className="yt-modal-backdrop" onClick={() => setIsCreatePlaylistOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Create New Playlist</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsCreatePlaylistOpen(false)}>✕</button>
            </div>
            <div className="yt-form-group">
              <label>Playlist Title</label>
              <input
                type="text"
                placeholder="e.g. My Favorite Tutorials"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                className="yt-form-input"
              />
            </div>
            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsCreatePlaylistOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="yt-btn-primary"
                disabled={!newPlaylistName.trim()}
                onClick={() => {
                  setPlaylists(prev => [
                    ...prev,
                    { id: Date.now().toString(), name: newPlaylistName.trim(), postIds: [] },
                  ])
                  setIsCreatePlaylistOpen(false)
                  setNewPlaylistName('')
                  setNotice('Playlist created!')
                  setTimeout(() => setNotice(''), 2500)
                }}
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: SHARE VIDEO MODAL
          ========================================================= */}
      {sharePost && (
        <div className="yt-modal-backdrop" onClick={() => setSharePost(null)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Share Video</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setSharePost(null)}>✕</button>
            </div>
            <p>Copy the link or share directly to your networks:</p>
            <div className="yt-share-url-box">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/watch?v=${sharePost.id}`}
                className="yt-share-input"
              />
              <button
                type="button"
                className="yt-btn-primary"
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/watch?v=${sharePost.id}`)
                  setCopiedLink(true)
                  setTimeout(() => setCopiedLink(false), 2000)
                }}
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 7: CREATE CHANNEL / PAGE MODAL
          ========================================================= */}
      {isOpenPageModal && (
        <div className="yt-modal-backdrop" onClick={() => setIsOpenPageModal(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Create Video Channel</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsOpenPageModal(false)}>✕</button>
            </div>
            {pageError && <div className="yt-modal-error-alert">{pageError}</div>}
            <div className="yt-form-group">
              <label>Channel Name</label>
              <input
                type="text"
                placeholder="e.g. Dhaka Studio"
                value={pageName}
                onChange={e => {
                  setPageName(e.target.value)
                  if (!pageSlug) setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }}
                className="yt-form-input"
              />
            </div>
            <div className="yt-form-group">
              <label>Channel Handle (Unique URL Slug)</label>
              <input
                type="text"
                placeholder="e.g. dhakastudio"
                value={pageSlug}
                onChange={e => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="yt-form-input"
              />
            </div>
            <div className="yt-form-group">
              <label>Category</label>
              <select
                value={pageCategory}
                onChange={e => setPageCategory(e.target.value)}
                className="yt-form-select"
              >
                <option value="Tech & Gadgets">Tech & Gadgets</option>
                <option value="Gaming">Gaming</option>
                <option value="Music">Music</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="News">News</option>
              </select>
            </div>
            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsOpenPageModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="yt-btn-primary"
                disabled={submittingPage || !pageName.trim() || !pageSlug.trim()}
                onClick={async () => {
                  setSubmittingPage(true)
                  setPageError('')
                  try {
                    await api.createCommunity(
                      token,
                      pageName.trim(),
                      pageSlug.trim(),
                      pageDescription.trim() || undefined,
                      'public',
                      'open',
                      pageCategory
                    )
                    setIsOpenPageModal(false)
                    setPageName('')
                    setPageSlug('')
                    setNotice('Channel created successfully! You can now upload videos.')
                    setTimeout(() => setNotice(''), 3000)
                    fetchAllData()
                  } catch (err) {
                    setPageError(err instanceof Error ? err.message : 'Could not create channel')
                  } finally {
                    setSubmittingPage(false)
                  }
                }}
              >
                {submittingPage ? 'Creating...' : 'Create Channel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 8: SAVE TO PLAYLIST MODAL (Module 8: Playlist)
          ========================================================= */}
      {isAddToPlaylistOpen && activeWatchPost && (
        <div className="yt-modal-backdrop" onClick={() => setIsAddToPlaylistOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <h3>Save Video to Playlist</h3>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsAddToPlaylistOpen(false)}>✕</button>
            </div>
            <p className="yt-modal-desc">
              Select one or more playlists to add <strong>"{activeWatchPost.title}"</strong>:
            </p>

            <div className="yt-modal-playlist-checklist">
              {playlists.map(pl => {
                const inPlaylist = pl.postIds.includes(activeWatchPost.id)
                return (
                  <label key={pl.id} className="yt-playlist-check-row">
                    <input
                      type="checkbox"
                      checked={inPlaylist}
                      onChange={() => handleTogglePlaylistPost(pl.id, activeWatchPost.id)}
                    />
                    <div className="yt-playlist-check-text">
                      <strong>{pl.name}</strong>
                      <small>{pl.postIds.length} {pl.postIds.length === 1 ? 'video' : 'videos'}</small>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="yt-modal-inline-new-playlist">
              <input
                type="text"
                placeholder="Create new playlist name..."
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                className="yt-form-input"
              />
              <button
                type="button"
                className="yt-btn-primary"
                disabled={!newPlaylistName.trim()}
                onClick={() => {
                  const newId = Date.now().toString()
                  setPlaylists(prev => [
                    ...prev,
                    { id: newId, name: newPlaylistName.trim(), postIds: [activeWatchPost.id] },
                  ])
                  setNewPlaylistName('')
                  setNotice('New playlist created and video added!')
                  setTimeout(() => setNotice(''), 2500)
                }}
              >
                + Create & Add
              </button>
            </div>

            <div className="yt-modal-footer">
              <button
                type="button"
                className="yt-btn-primary"
                onClick={() => setIsAddToPlaylistOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 9: REPORT VIDEO MODAL (Module 14: Moderation)
          ========================================================= */}
      {isReportModalOpen && activeWatchPost && (
        <div className="yt-modal-backdrop" onClick={() => setIsReportModalOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title-with-icon">
                <IconFlag size={20} />
                <h3>Report Video</h3>
              </div>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsReportModalOpen(false)}>✕</button>
            </div>
            <p className="yt-modal-desc">
              If this video violates Gather Community Guidelines, submit a report for immediate moderator evaluation:
            </p>

            <div className="yt-report-reasons-list">
              {[
                'Spam, misleading or fraudulent metadata',
                'Sexual content or mature media without age gate',
                'Hate speech, harassment or bullying',
                'Harmful, violent or dangerous activities',
                'Copyright infringement or intellectual property',
                'Violates child safety or underage restrictions',
              ].map(reason => (
                <label key={reason} className="yt-report-radio-row">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={e => setReportReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="yt-form-group">
              <label>Additional Information (Optional):</label>
              <textarea
                rows={3}
                placeholder="Provide timestamps or specific details to help our review team..."
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                className="yt-form-textarea"
              />
            </div>

            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsReportModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="yt-btn-primary red" onClick={handleSubmitReport}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 10: EDIT VIDEO DETAILS (Module 3: Video Edit)
          ========================================================= */}
      {editingPost && (
        <div className="yt-modal-backdrop" onClick={() => setEditingPost(null)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title-with-icon">
                <IconEdit size={20} />
                <h3>Edit Video Details</h3>
              </div>
              <button type="button" className="yt-modal-close-btn" onClick={() => setEditingPost(null)}>✕</button>
            </div>

            <div className="yt-form-group">
              <label>Video Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="yt-form-input"
              />
            </div>

            <div className="yt-form-group">
              <label>Description & Chapters</label>
              <textarea
                rows={4}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="yt-form-textarea"
                placeholder="Include timestamps (e.g. 0:00 Intro, 1:30 Setup) for interactive chapters"
              />
            </div>

            <div className="yt-form-row">
              <div className="yt-form-group half">
                <label>Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="yt-form-select"
                >
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Music">Music</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="News">News</option>
                </select>
              </div>

              <div className="yt-form-group half">
                <label>Visibility</label>
                <select
                  value={editVisibility}
                  onChange={e => setEditVisibility(e.target.value as any)}
                  className="yt-form-select"
                >
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="unlisted">Unlisted (Anyone with link)</option>
                  <option value="private">Private (Only channel managers)</option>
                </select>
              </div>
            </div>

            <div className="yt-modal-footer">
              <button
                type="button"
                className="yt-btn-secondary"
                onClick={() => setEditingPost(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="yt-btn-primary"
                disabled={submittingEdit || !editTitle.trim()}
                onClick={handleSaveEditPost}
              >
                {submittingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 11: DISPUTE COPYRIGHT CLAIM (Module 13: Copyright)
          ========================================================= */}
      {isDisputeModalOpen && (
        <div className="yt-modal-backdrop" onClick={() => setIsDisputeModalOpen(false)}>
          <div className="yt-modal-card" onClick={e => e.stopPropagation()}>
            <div className="yt-modal-header">
              <div className="yt-modal-title-with-icon">
                <IconCopyright size={20} />
                <h3>Dispute Content ID Claim #{disputeClaimId}</h3>
              </div>
              <button type="button" className="yt-modal-close-btn" onClick={() => setIsDisputeModalOpen(false)}>✕</button>
            </div>
            <p className="yt-modal-desc">
              Select the legal grounds upon which you are contesting this automated Content ID match:
            </p>

            <div className="yt-dispute-grounds-list">
              <label className="yt-dispute-option-card">
                <input
                  type="radio"
                  name="disputeGrounds"
                  value="original"
                  checked={disputeGrounds === 'original'}
                  onChange={e => setDisputeGrounds(e.target.value as any)}
                />
                <div>
                  <strong>Original Content</strong>
                  <small>I am the original creator and own all master audio and video rights in this upload.</small>
                </div>
              </label>

              <label className="yt-dispute-option-card">
                <input
                  type="radio"
                  name="disputeGrounds"
                  value="licensed"
                  checked={disputeGrounds === 'licensed'}
                  onChange={e => setDisputeGrounds(e.target.value as any)}
                />
                <div>
                  <strong>Commercial License or Written Permission</strong>
                  <small>I have purchased or received explicit commercial distribution authorization from the claimant.</small>
                </div>
              </label>

              <label className="yt-dispute-option-card">
                <input
                  type="radio"
                  name="disputeGrounds"
                  value="fair_use"
                  checked={disputeGrounds === 'fair_use'}
                  onChange={e => setDisputeGrounds(e.target.value as any)}
                />
                <div>
                  <strong>Fair Use Doctrine</strong>
                  <small>Content is used transformatively for commentary, criticism, news reporting, scholarship or education.</small>
                </div>
              </label>

              <label className="yt-dispute-option-card">
                <input
                  type="radio"
                  name="disputeGrounds"
                  value="public_domain"
                  checked={disputeGrounds === 'public_domain'}
                  onChange={e => setDisputeGrounds(e.target.value as any)}
                />
                <div>
                  <strong>Public Domain</strong>
                  <small>The work is not protected under copyright law or rights have legally expired.</small>
                </div>
              </label>
            </div>

            <div className="yt-form-group">
              <label>Legal Statement & Justification (Required):</label>
              <textarea
                rows={3}
                placeholder="State why your use of the claimed content does not infringe copyright..."
                value={disputeExplanation}
                onChange={e => setDisputeExplanation(e.target.value)}
                className="yt-form-textarea"
              />
            </div>

            <div className="yt-modal-footer">
              <button type="button" className="yt-btn-secondary" onClick={() => setIsDisputeModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="yt-btn-primary"
                disabled={!disputeExplanation.trim()}
                onClick={handleSubmitDispute}
              >
                Submit Legal Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

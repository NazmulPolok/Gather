const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export function getWebSocketUrl(path: string, token: string): string {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  let base = `${wsProtocol}//${window.location.host}`
  if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
    const url = new URL(API_URL)
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    base = `${protocol}//${url.host}`
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}?token=${encodeURIComponent(token)}`
}

export function getMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) return path
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export type PresetAvatar = {
  id: string
  label: string
  emoji: string
  bg: string
  color: string
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: 'preset:fox', label: 'Fox', emoji: '🦊', bg: '#feeed9', color: '#c25816' },
  { id: 'preset:panda', label: 'Panda', emoji: '🐼', bg: '#e8f3ea', color: '#2b5f3a' },
  { id: 'preset:lion', label: 'Lion', emoji: '🦁', bg: '#fff2d6', color: '#aa7119' },
  { id: 'preset:robot', label: 'Robot', emoji: '🤖', bg: '#e2f2f7', color: '#1e6884' },
  { id: 'preset:ninja', label: 'Ninja', emoji: '🥷', bg: '#efe8f7', color: '#5f358a' },
  { id: 'preset:astronaut', label: 'Astronaut', emoji: '🚀', bg: '#e4edf7', color: '#275283' },
  { id: 'preset:cat', label: 'Cat', emoji: '🐱', bg: '#fbe7ea', color: '#a0314b' },
  { id: 'preset:wizard', label: 'Wizard', emoji: '🧙', bg: '#f2e8fc', color: '#6d2db2' },
  { id: 'preset:bear', label: 'Bear', emoji: '🐻', bg: '#f5ebe3', color: '#7a4e2f' },
  { id: 'preset:tiger', label: 'Tiger', emoji: '🐯', bg: '#fdeee2', color: '#b3561a' },
  { id: 'preset:owl', label: 'Owl', emoji: '🦉', bg: '#e5f1f0', color: '#2a6a66' },
  { id: 'preset:frog', label: 'Frog', emoji: '🐸', bg: '#ebf5e7', color: '#38732e' },
]

export function getPresetAvatar(id?: string | null): PresetAvatar | undefined {
  if (!id || !id.startsWith('preset:')) return undefined
  return PRESET_AVATARS.find(a => a.id === id)
}

export type AuthUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  avatar_url?: string | null
  nickname?: string | null
}

export type AuthResponse = {
  access_token: string
  token_type: string
  user: AuthUser
}

export type Group = {
  id: number
  name: string
  invite_code: string
  owner_id: number
  join_policy: 'open' | 'approval'
  avatar_url?: string | null
}

export type Member = {
  user_id: number
  email: string
  first_name: string
  last_name: string
  username: string
  role: 'admin' | 'member'
  status: 'active' | 'pending' | 'rejected'
  nickname?: string | null
  avatar_url?: string | null
  last_seen_at?: string | null
  is_online?: boolean
}

export function formatLastSeen(lastSeenAt?: string | null): string {
  if (!lastSeenAt) return 'Offline'
  try {
    const date = new Date(lastSeenAt)
    const now = Date.now()
    const diffMs = now - date.getTime()
    if (diffMs < 60 * 1000) {
      return 'Active 1m ago'
    }
    const diffMins = Math.floor(diffMs / (60 * 1000))
    if (diffMins < 60) {
      return `Active ${diffMins}m ago`
    }
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) {
      return `Active ${diffHours}h ago`
    }
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) {
      return 'Active yesterday'
    }
    if (diffDays < 7) {
      return `Active ${diffDays}d ago`
    }
    return `Active on ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
  } catch {
    return 'Offline'
  }
}

export type SeenUser = {
  user_id: number
  name: string
  username: string
  avatar_url?: string | null
  read_at?: string | null
}

export type Message = {
  id: number
  group_id: number
  sender_id: number
  sender_name: string
  sender_username: string
  sender_avatar_url?: string | null
  message_type: 'text' | 'image'
  body?: string | null
  image_url?: string | null
  is_anonymous?: boolean
  created_at: string
  status?: 'sending' | 'sent' | 'delivered' | 'seen'
  seen_by?: SeenUser[]
}

export type NotificationItem = {
  id: number
  group_id: number
  group_name: string
  actor_id: number
  actor_name: string
  actor_username: string
  notification_type: 'join_request' | 'message'
  resolution: 'accepted' | 'declined' | null
  message_id: number | null
  read_at: string | null
  created_at: string
}

export type NotificationFeed = { items: NotificationItem[]; unread_count: number }

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { detail?: string }
    throw new ApiError(payload.detail || `Request failed (${response.status})`, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  signup: (first_name: string, last_name: string, username: string, email: string, password: string) => request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ first_name, last_name, username, email, password }) }),
  login: (email: string, password: string) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  requestResetOTP: (email: string) => request<{ status: string; message: string }>('/api/auth/forgot-password/request-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyResetOTP: (email: string, otp: string, new_password: string) => request<AuthResponse>('/api/auth/forgot-password/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp, new_password }) }),
  me: (token: string) => request<AuthUser>('/api/auth/me', {}, token),
  updateProfile: (token: string, data: { nickname?: string | null; avatar_url?: string | null }) => request<AuthUser>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }, token),
  updateAvatar: (token: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<AuthUser>('/api/auth/avatar', { method: 'POST', body: formData }, token)
  },
  removeAvatar: (token: string) => request<AuthUser>('/api/auth/avatar', { method: 'DELETE' }, token),
  groups: (token: string) => request<Group[]>('/api/groups', {}, token),
  createGroup: (token: string, name: string, join_policy: Group['join_policy']) => request<Group>('/api/groups', { method: 'POST', body: JSON.stringify({ name, join_policy }) }, token),
  updateGroup: (token: string, groupId: number, data: { name?: string; join_policy?: Group['join_policy']; avatar_url?: string | null }) => request<Group>(`/api/groups/${groupId}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  uploadGroupAvatar: (token: string, groupId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<Group>(`/api/groups/${groupId}/avatar`, { method: 'POST', body: formData }, token)
  },
  removeGroupAvatar: (token: string, groupId: number) => request<Group>(`/api/groups/${groupId}/avatar`, { method: 'DELETE' }, token),
  joinGroup: (token: string, inviteCode: string) => request<{ status: string }>(`/api/groups/join/${encodeURIComponent(inviteCode)}`, { method: 'POST' }, token),
  messages: (token: string, groupId: number) => request<Message[]>(`/api/groups/${groupId}/messages?limit=100`, {}, token),
  deleteMessage: (token: string, groupId: number, messageId: number) =>
    request<{ status: string; message_id: number }>(`/api/groups/${groupId}/messages/${messageId}`, { method: 'DELETE' }, token),
  sendText: (token: string, groupId: number, body: string, is_anonymous = false) => request<Message>(`/api/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ message_type: 'text', body, is_anonymous }) }, token),
  uploadGroupImage: (token: string, groupId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ image_url: string }>(`/api/groups/${groupId}/upload-image`, { method: 'POST', body: formData }, token)
  },
  sendImage: (token: string, groupId: number, imageUrl: string, caption?: string, is_anonymous = false) =>
    request<Message>(
      `/api/groups/${groupId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          message_type: 'image',
          image_url: imageUrl,
          body: caption || null,
          is_anonymous,
        }),
      },
      token
    ),
  members: (token: string, groupId: number) => request<Member[]>(`/api/groups/${groupId}/members`, {}, token),
  approveMember: (token: string, groupId: number, userId: number) => request<{ status: string }>(`/api/groups/${groupId}/members/${userId}/approve`, { method: 'POST' }, token),
  updateNickname: (token: string, groupId: number, targetUserId: number, nickname: string | null) => request<{ status: string; user_id: number; nickname: string | null }>(`/api/groups/${groupId}/members/${targetUserId}/nickname`, { method: 'PATCH', body: JSON.stringify({ nickname }) }, token),
  leaveGroup: (token: string, groupId: number) => request<{ status: string }>(`/api/groups/${groupId}/leave`, { method: 'DELETE' }, token),
  removeMember: (token: string, groupId: number, userId: number) => request<{ status: string }>(`/api/groups/${groupId}/members/${userId}`, { method: 'DELETE' }, token),
  notifications: (token: string) => request<NotificationFeed>('/api/notifications?limit=50', {}, token),
  markNotificationRead: (token: string, notificationId: number) => request<{ status: string }>(`/api/notifications/${notificationId}/read`, { method: 'PATCH' }, token),
  markAllNotificationsRead: (token: string) => request<{ status: string }>('/api/notifications/read-all', { method: 'PATCH' }, token),
  markGroupMessagesRead: (token: string, groupId: number) => request<{ status: string }>(`/api/notifications/groups/${groupId}/read`, { method: 'PATCH' }, token),
  respondToJoinRequest: (token: string, notificationId: number, action: 'accept' | 'decline') => request<{ status: string }>(`/api/notifications/${notificationId}/respond`, { method: 'POST', body: JSON.stringify({ action }) }, token),
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export type AuthResponse = {
  access_token: string
  token_type: string
  user: { id: number; email: string; first_name: string; last_name: string; username: string }
}

export type Group = {
  id: number
  name: string
  invite_code: string
  owner_id: number
  join_policy: 'open' | 'approval'
}

export type Member = {
  user_id: number
  email: string
  first_name: string
  last_name: string
  username: string
  role: 'admin' | 'member'
  status: 'active' | 'pending' | 'rejected'
}

export type Message = {
  id: number
  group_id: number
  sender_id: number
  sender_name: string
  sender_username: string
  message_type: 'text'
  body: string
  is_anonymous?: boolean
  created_at: string
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
  me: (token: string) => request<AuthResponse['user']>('/api/auth/me', {}, token),
  groups: (token: string) => request<Group[]>('/api/groups', {}, token),
  createGroup: (token: string, name: string, join_policy: Group['join_policy']) => request<Group>('/api/groups', { method: 'POST', body: JSON.stringify({ name, join_policy }) }, token),
  updateGroup: (token: string, groupId: number, data: { name?: string; join_policy?: Group['join_policy'] }) => request<Group>(`/api/groups/${groupId}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  joinGroup: (token: string, inviteCode: string) => request<{ status: string }>(`/api/groups/join/${encodeURIComponent(inviteCode)}`, { method: 'POST' }, token),
  messages: (token: string, groupId: number) => request<Message[]>(`/api/groups/${groupId}/messages?limit=100`, {}, token),
  sendText: (token: string, groupId: number, body: string, is_anonymous = false) => request<Message>(`/api/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ message_type: 'text', body, is_anonymous }) }, token),
  members: (token: string, groupId: number) => request<Member[]>(`/api/groups/${groupId}/members`, {}, token),
  approveMember: (token: string, groupId: number, userId: number) => request<{ status: string }>(`/api/groups/${groupId}/members/${userId}/approve`, { method: 'POST' }, token),
  leaveGroup: (token: string, groupId: number) => request<{ status: string }>(`/api/groups/${groupId}/leave`, { method: 'DELETE' }, token),
  removeMember: (token: string, groupId: number, userId: number) => request<{ status: string }>(`/api/groups/${groupId}/members/${userId}`, { method: 'DELETE' }, token),
  notifications: (token: string) => request<NotificationFeed>('/api/notifications?limit=50', {}, token),
  markNotificationRead: (token: string, notificationId: number) => request<{ status: string }>(`/api/notifications/${notificationId}/read`, { method: 'PATCH' }, token),
  markAllNotificationsRead: (token: string) => request<{ status: string }>('/api/notifications/read-all', { method: 'PATCH' }, token),
  markGroupMessagesRead: (token: string, groupId: number) => request<{ status: string }>(`/api/notifications/groups/${groupId}/read`, { method: 'PATCH' }, token),
  respondToJoinRequest: (token: string, notificationId: number, action: 'accept' | 'decline') => request<{ status: string }>(`/api/notifications/${notificationId}/respond`, { method: 'POST', body: JSON.stringify({ action }) }, token),
}

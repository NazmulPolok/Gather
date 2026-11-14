import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { api, formatLastSeen, getMediaUrl, getWebSocketUrl, type AuthUser, type Group, type Member, type Message, type NotificationItem } from '../api/client'
import { GroupAvatar } from '../components/GroupAvatar'
import { UserAvatar } from '../components/UserAvatar'

function formatChatDateDivider(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const now = new Date()

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const msgStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((todayStart - msgStart) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function getMessageDateKey(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function ChatHome({
  token,
  user,
  onUserUpdated,
  notificationTarget,
  onNotificationHandled,
  unreadGroups,
  onUnreadGroups,
}: {
  token: string
  user: AuthUser
  onUserUpdated?: (user: AuthUser) => void
  notificationTarget: NotificationItem | null
  onNotificationHandled: () => void
  unreadGroups: Record<number, number>
  onUnreadGroups: (counts: Record<number, number>) => void
}) {
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [messageText, setMessageText] = useState('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [joinPolicy, setJoinPolicy] = useState<'open' | 'approval'>('open')
  const [busy, setBusy] = useState(false)
  const [sendAsAnonymous, setSendAsAnonymous] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiList = ['😀', '😂', '🥰', '👍', '🎉', '❤️', '🚀', '👎', '😢', '😎']
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [renameBusy, setRenameBusy] = useState(false)
  const groupFileInputRef = useRef<HTMLInputElement | null>(null)
  const [savingGroupPhoto, setSavingGroupPhoto] = useState(false)
  const [pendingHeaderPhoto, setPendingHeaderPhoto] = useState<File | null>(null)
  const [pendingHeaderPreview, setPendingHeaderPreview] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Record<number, { name: string; avatar_url?: string | null; is_anonymous?: boolean; lastActive: number }>>({})
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set())
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const isCurrentlyTypingRef = useRef(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [chatError, setChatError] = useState('')
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null)
  const [deletingMessage, setDeletingMessage] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const chatImageInputRef = useRef<HTMLInputElement>(null)
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [mentionRange, setMentionRange] = useState<{ start: number; end: number } | null>(null)

  async function handleDeleteMessage(msg: Message) {
    if (!activeGroup || deletingMessage) return
    setDeletingMessage(true)
    setError('')
    try {
      await api.deleteMessage(token, activeGroup.id, msg.id)
      setMessages(current => current.filter(m => m.id !== msg.id))
      setMessageToDelete(null)
      setNotice('Message deleted for everyone.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete message')
    } finally {
      setDeletingMessage(false)
    }
  }

  async function handleEditMessage(messageId: number, newBody: string) {
    if (!activeGroup) return
    try {
      const updated = await api.editMessage(token, activeGroup.id, messageId, newBody)
      setMessages(current => current.map(m => m.id === messageId ? updated : m))
      setNotice('Message edited.')
      setChatError('')
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : 'Could not edit message'
      setChatError(msg)
      throw cause
    }
  }

  const refreshGroups = useCallback(async (): Promise<Group[]> => {
    setLoadingGroups(true)
    try {
      const result = await api.groups(token)
      setGroups(result)
      setActiveGroup(current => current ? result.find(group => group.id === current.id) ?? null : null)
      setError('')
      return result
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load groups')
      return []
    } finally {
      setLoadingGroups(false)
    }
  }, [token])

  useEffect(() => { void refreshGroups() }, [refreshGroups])

  useEffect(() => {
    if (!notificationTarget || loadingGroups) return
    const group = groups.find(item => item.id === notificationTarget.group_id)
    if (!group) {
      setError('That notification belongs to a group you can no longer access.')
      onNotificationHandled()
      return
    }
    setActiveGroup(group)
    setShowMembers(notificationTarget.notification_type === 'join_request')
    setMobileSidebarOpen(false)
    setNotice(notificationTarget.notification_type === 'join_request' ? `Review the new request to join “${group.name}”.` : `New message in “${group.name}”.`)
    onNotificationHandled()
  }, [notificationTarget, groups, loadingGroups, onNotificationHandled])

  const loadMessages = useCallback(async (groupId: number, quiet = false) => {
    if (!quiet) setLoadingMessages(true)
    try {
      const result = await api.messages(token, groupId)
      setMessages(current => {
        // Keep any pending optimistic messages currently in-flight
        const pending = current.filter(m => m.id < 0)
        const seenIds = new Set<number>()
        const uniqueResult: Message[] = []
        for (const m of result) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id)
            uniqueResult.push(m)
          }
        }
        return [...uniqueResult, ...pending]
      })
      setChatError('')
    } catch (cause) {
      if (!quiet) setChatError(cause instanceof Error ? cause.message : 'Could not load messages')
    } finally {
      if (!quiet) setLoadingMessages(false)
    }
  }, [token])

  useEffect(() => {
    setIsEditingName(false)
    if (!activeGroup) {
      setMessages([])
      setMembers([])
      return
    }
    const groupId = activeGroup.id
    void loadMessages(groupId)
    void api.members(token, groupId).then(setMembers).catch(() => setMembers([]))
    const interval = window.setInterval(() => { void loadMessages(groupId, true) }, 5000)
    return () => window.clearInterval(interval)
  }, [activeGroup?.id, token, loadMessages])

  const isAdmin = Boolean(
    activeGroup && (
      activeGroup.owner_id === user.id ||
      members.some(member => member.user_id === user.id && member.role === 'admin' && member.status === 'active')
    )
  )

  async function updateGroupSettings(newName: string, newPolicy?: Group['join_policy']) {
    if (!activeGroup) return
    const trimmed = newName.trim()
    if (!trimmed) {
      setError('Group name cannot be empty')
      return
    }
    setRenameBusy(true)
    setError('')
    try {
      const updated = await api.updateGroup(token, activeGroup.id, {
        name: trimmed,
        ...(newPolicy ? { join_policy: newPolicy } : {}),
      })
      setActiveGroup(updated)
      setGroups(current => current.map(item => item.id === updated.id ? updated : item))
      setIsEditingName(false)
      setNotice(`Group updated to “${updated.name}”.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update group')
      throw cause
    } finally {
      setRenameBusy(false)
    }
  }

  async function uploadGroupPhoto(file: File) {
    if (!activeGroup || !token) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Group photo cannot exceed 10MB.')
      return
    }
    setSavingGroupPhoto(true)
    setError('')
    try {
      const updated = await api.uploadGroupAvatar(token, activeGroup.id, file)
      setActiveGroup(updated)
      setGroups(current => current.map(item => item.id === updated.id ? updated : item))
      setNotice('Group photo updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload group photo')
    } finally {
      setSavingGroupPhoto(false)
    }
  }

  async function handleSaveHeaderPhoto() {
    if (!pendingHeaderPhoto) return
    await uploadGroupPhoto(pendingHeaderPhoto)
    setPendingHeaderPhoto(null)
    setPendingHeaderPreview(null)
  }

  function handleCancelHeaderPhoto() {
    setPendingHeaderPhoto(null)
    setPendingHeaderPreview(null)
  }

  async function removeGroupPhoto() {
    if (!activeGroup || !token) return
    setSavingGroupPhoto(true)
    setError('')
    try {
      const updated = await api.removeGroupAvatar(token, activeGroup.id)
      setActiveGroup(updated)
      setGroups(current => current.map(item => item.id === updated.id ? updated : item))
      setNotice('Group photo removed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove group photo')
    } finally {
      setSavingGroupPhoto(false)
    }
  }

  useEffect(() => {
    if (!activeGroup) return
    const groupId = activeGroup.id
    void api.markGroupMessagesRead(token, groupId).then(() => {
      if (unreadGroups[groupId]) {
        const next = { ...unreadGroups }
        delete next[groupId]
        onUnreadGroups(next)
      }
    }).catch(() => undefined)

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'mark_read' }))
      } catch {
        // ws send error ignored
      }
    }
  }, [activeGroup?.id, messages.length, token, unreadGroups, onUnreadGroups])

  const sendTypingEvent = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    if (isCurrentlyTypingRef.current === isTyping) return
    isCurrentlyTypingRef.current = isTyping
    try {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping,
        is_anonymous: sendAsAnonymous,
      }))
    } catch {
      // ws send error ignored
    }
  }, [sendAsAnonymous])

  function checkMentionTrigger(text: string) {
    const textarea = composerTextareaRef.current
    const cursor = textarea ? textarea.selectionStart : text.length
    const textBefore = text.slice(0, cursor)
    const match = /(?:^|\s)@([a-zA-Z0-9_.-]*)$/.exec(textBefore)
    if (match) {
      const q = match[1]
      const matchIndex = match.index + (match[0].startsWith(' ') ? 1 : 0)
      setMentionQuery(q)
      setMentionRange({ start: matchIndex, end: cursor })
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
      setMentionRange(null)
    }
  }

  function handleComposerInput(val: string) {
    setMessageText(val)
    checkMentionTrigger(val)
    if (val.trim()) {
      sendTypingEvent(true)
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = window.setTimeout(() => {
        sendTypingEvent(false)
      }, 2500)
    } else {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current)
      }
      sendTypingEvent(false)
    }
  }

  // Connect group WebSocket for real-time typing indicators and instant messages
  useEffect(() => {
    if (!activeGroup) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setTypingUsers({})
      return
    }
    let active = true
    let reconnectTimer: number | null = null

    function connect() {
      if (!active || !activeGroup) return
      const wsUrl = getWebSocketUrl(`/api/groups/${activeGroup.id}/ws`, token)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'presence_state') {
            const ids = new Set<number>(data.online_user_ids || [])
            setOnlineUserIds(ids)
            setMembers(current =>
              current.map(m => ({
                ...m,
                is_online: ids.has(m.user_id),
              }))
            )
          } else if (data.type === 'presence') {
            const { user_id, is_online, last_seen_at } = data
            setOnlineUserIds(current => {
              const next = new Set(current)
              if (is_online) next.add(user_id)
              else next.delete(user_id)
              return next
            })
            setMembers(current =>
              current.map(m =>
                m.user_id === user_id
                  ? {
                      ...m,
                      is_online,
                      ...(last_seen_at ? { last_seen_at } : {}),
                    }
                  : m
              )
            )
          } else if (data.type === 'typing') {
            const { user_id, name, avatar_url, is_typing, is_anonymous } = data
            setTypingUsers(current => {
              const next = { ...current }
              if (is_typing) {
                next[user_id] = { name, avatar_url, is_anonymous, lastActive: Date.now() }
              } else {
                delete next[user_id]
              }
              return next
            })
          } else if (data.type === 'new_message') {
            const newMsg = data.message as Message
            setMessages(current => {
              // 1. If this exact message ID is already present, update it
              if (current.some(m => m.id === newMsg.id)) {
                return current.map(m => (m.id === newMsg.id ? newMsg : m))
              }
              // 2. If sent by current user, replace matching pending optimistic message (negative ID)
              if (newMsg.sender_id === user.id) {
                const pendingIdx = current.findIndex(
                  m => m.id < 0 && (
                    (newMsg.message_type === 'text' && m.body === newMsg.body) ||
                    (newMsg.message_type === 'image' && (m.image_url === newMsg.image_url || m.body === newMsg.body))
                  )
                )
                if (pendingIdx !== -1) {
                  return current.map((m, idx) => (idx === pendingIdx ? newMsg : m))
                }
              }
              // 3. Otherwise append new message
              return [...current, newMsg]
            })
            setTypingUsers(current => {
              if (!current[newMsg.sender_id]) return current
              const next = { ...current }
              delete next[newMsg.sender_id]
              return next
            })
          } else if (data.type === 'messages_delivered') {
            const { user_id: deliveredUserId } = data
            if (deliveredUserId !== user.id) {
              setMessages(current =>
                current.map(m =>
                  m.sender_id === user.id && (!m.status || m.status === 'sent')
                    ? { ...m, status: 'delivered' }
                    : m
                )
              )
            }
          } else if (data.type === 'messages_read') {
            const { user_id: readerId, name, username, avatar_url, read_at } = data
            if (readerId !== user.id) {
              setMessages(current =>
                current.map(m => {
                  if (m.sender_id === user.id) {
                    const existing = m.seen_by || []
                    const updatedSeen = existing.some(s => s.user_id === readerId)
                      ? existing
                      : [...existing, { user_id: readerId, name, username, avatar_url, read_at }]
                    return { ...m, status: 'seen', seen_by: updatedSeen }
                  }
                  return m
                })
              )
            }
          } else if (data.type === 'delete_message') {
            const deletedId = data.message_id as number
            setMessages(current => current.filter(m => m.id !== deletedId))
          } else if (data.type === 'edit_message') {
            const { message_id, body, is_edited, edited_at } = data
            setMessages(current =>
              current.map(m =>
                m.id === message_id
                  ? { ...m, body, is_edited: Boolean(is_edited), edited_at }
                  : m
              )
            )
          }
        } catch (err) {
          console.error('WS message error:', err)
        }
      }

      ws.onclose = () => {
        if (!active) return
        reconnectTimer = window.setTimeout(connect, 2500)
      }
    }

    connect()

    return () => {
      active = false
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setTypingUsers({})
      isCurrentlyTypingRef.current = false
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    }
  }, [activeGroup?.id, token])

  // Periodic cleanup for expired typing indicators (if user closes browser without blur)
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now()
      setTypingUsers(current => {
        let changed = false
        const next = { ...current }
        for (const [idStr, info] of Object.entries(next)) {
          if (now - info.lastActive > 4000) {
            delete next[Number(idStr)]
            changed = true
          }
        }
        return changed ? next : current
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const typingCount = Object.keys(typingUsers).length
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, activeGroup?.id, typingCount])

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!groupName.trim()) return
    setBusy(true); setError(''); setNotice('')
    try {
      const group = await api.createGroup(token, groupName.trim(), joinPolicy)
      setGroupName(''); setShowCreate(false); await refreshGroups(); setActiveGroup(group)
      setNotice(`“${group.name}” is ready. Share invite code ${group.invite_code} with people you want to invite.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create group') }
    finally { setBusy(false) }
  }

  async function joinGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const inviteCode = joinId.trim().toUpperCase()
    if (!/^[A-Z0-9]{8}$/.test(inviteCode)) { setError('Enter the 8-character group invite code.'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await api.joinGroup(token, inviteCode)
      setJoinId('')
      if (result.status === 'pending') setNotice('Request sent. A group admin needs to approve you before you can see the conversation.')
      else { const refreshed = await refreshGroups(); const group = refreshed.find(item => item.invite_code === inviteCode); if (group) setActiveGroup(group); setNotice('You joined the group.') }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not join group') }
    finally { setBusy(false) }
  }

  function handleChatImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 10 * 1024 * 1024) {
      setChatError('Image size cannot exceed 10MB.')
      return
    }
    setAttachedImage(file)
    setAttachedPreview(URL.createObjectURL(file))
  }

  function clearAttachedImage() {
    if (attachedPreview) {
      URL.revokeObjectURL(attachedPreview)
    }
    setAttachedImage(null)
    setAttachedPreview(null)
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeGroup || busy) return
    const body = messageText.trim()
    if (!body && !attachedImage) return
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
    }
    sendTypingEvent(false)
    setBusy(true)
    setChatError('')

    const tempId = -Date.now()
    const optimisticMsg: Message = {
      id: tempId,
      group_id: activeGroup.id,
      sender_id: user.id,
      sender_name: sendAsAnonymous ? 'Anonymous' : (activeNickname || user.nickname || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username),
      sender_username: sendAsAnonymous ? 'anonymous' : user.username,
      sender_avatar_url: sendAsAnonymous ? null : user.avatar_url,
      message_type: attachedImage ? 'image' : 'text',
      body: body || null,
      image_url: attachedPreview || null,
      is_anonymous: sendAsAnonymous,
      created_at: new Date().toISOString(),
      status: 'sending',
      seen_by: [],
    }
    setMessages(current => [...current, optimisticMsg])

    try {
      if (attachedImage) {
        const uploadRes = await api.uploadGroupImage(token, activeGroup.id, attachedImage)
        const sent = await api.sendImage(token, activeGroup.id, uploadRes.image_url, body || undefined, sendAsAnonymous)
        setMessages(current => {
          // If WebSocket broadcast already arrived and added/reconciled this message:
          if (current.some(m => m.id === sent.id)) {
            return current.filter(m => m.id !== tempId).map(m => m.id === sent.id ? sent : m)
          }
          return current.map(m => (m.id === tempId ? sent : m))
        })
        clearAttachedImage()
        setMessageText('')
      } else {
        const sent = await api.sendText(token, activeGroup.id, body, sendAsAnonymous)
        setMessages(current => {
          // If WebSocket broadcast already arrived and added/reconciled this message:
          if (current.some(m => m.id === sent.id)) {
            return current.filter(m => m.id !== tempId).map(m => m.id === sent.id ? sent : m)
          }
          return current.map(m => (m.id === tempId ? sent : m))
        })
        setMessageText('')
      }
    } catch (cause) {
      setMessages(current => current.filter(m => m.id !== tempId))
      setChatError(cause instanceof Error ? cause.message : 'Message could not be sent')
    } finally {
      setBusy(false)
    }
  }

  async function approve(member: Member) {
    if (!activeGroup) return
    try {
      await api.approveMember(token, activeGroup.id, member.user_id)
      setMembers(current => current.map(item => item.user_id === member.user_id ? { ...item, status: 'active' } : item))
    } catch (cause) { setChatError(cause instanceof Error ? cause.message : 'Could not approve member') }
  }

  async function removeMember(member: Member) {
    if (!activeGroup || !window.confirm(`Remove ${member.email} from this group?`)) return
    try {
      await api.removeMember(token, activeGroup.id, member.user_id)
      setMembers(current => current.filter(item => item.user_id !== member.user_id))
      setNotice(`${member.email} was removed from the group.`)
      setChatError('')
    } catch (cause) { setChatError(cause instanceof Error ? cause.message : 'Could not remove member') }
  }

  async function updateMemberRole(member: Member, role: Member['role']) {
    if (!activeGroup) return
    try {
      await api.updateMemberRole(token, activeGroup.id, member.user_id, role)
      setMembers(current => current.map(item => item.user_id === member.user_id ? { ...item, role } : item))
      const targetName = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username
      setNotice(`${targetName} role updated to ${role.toUpperCase()}.`)
      setChatError('')
    } catch (cause) {
      setChatError(cause instanceof Error ? cause.message : 'Could not update role')
    }
  }

  async function updateMemberNickname(member: Member, nickname: string | null) {
    if (!activeGroup) return
    try {
      const res = await api.updateNickname(token, activeGroup.id, member.user_id, nickname)
      setMembers(current => current.map(item => item.user_id === member.user_id ? { ...item, nickname: res.nickname } : item))
      void loadMessages(activeGroup.id, true)
      const targetName = [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username
      setNotice(res.nickname ? `${member.user_id === user.id ? 'Your' : `${targetName}’s`} nickname set to “${res.nickname}”.` : `${member.user_id === user.id ? 'Your' : `${targetName}’s`} nickname cleared.`)
      setChatError('')
    } catch (cause) { setChatError(cause instanceof Error ? cause.message : 'Could not update nickname') }
  }

  async function leaveGroup() {
    if (!activeGroup || !window.confirm('Leave this group? If you are its last active member, the group will be deleted.')) return
    try {
      const result = await api.leaveGroup(token, activeGroup.id)
      const name = activeGroup.name
      setActiveGroup(null)
      setShowMembers(false)
      await refreshGroups()
      setNotice(result.status === 'group_deleted' ? `You were the last member, so “${name}” was deleted.` : `You left “${name}”.`)
    } catch (cause) { setChatError(cause instanceof Error ? cause.message : 'Could not leave group') }
  }

  const activeMembersForMention = members.filter(m => m.status === 'active' && m.user_id !== user.id)
  const mentionCandidates = mentionQuery === null ? [] : activeMembersForMention.filter(m => {
    if (!mentionQuery) return true
    const q = mentionQuery.toLowerCase()
    const name = (m.nickname || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.username).toLowerCase()
    return m.username.toLowerCase().includes(q) || name.includes(q)
  })

  function insertMention(candidate: Member) {
    if (!mentionRange) return
    const before = messageText.slice(0, mentionRange.start)
    const after = messageText.slice(mentionRange.end)
    const insertion = `@${candidate.username} `
    const nextText = `${before}${insertion}${after}`
    setMessageText(nextText)
    setMentionQuery(null)
    setMentionRange(null)
    setTimeout(() => {
      if (composerTextareaRef.current) {
        composerTextareaRef.current.focus()
        const newCursor = before.length + insertion.length
        composerTextareaRef.current.setSelectionRange(newCursor, newCursor)
      }
    }, 0)
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && mentionCandidates.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setMentionIndex(i => (i + 1) % mentionCandidates.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setMentionIndex(i => (i - 1 + mentionCandidates.length) % mentionCandidates.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        insertMention(mentionCandidates[mentionIndex])
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        setMentionQuery(null)
        setMentionRange(null)
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() }
  }

  const pendingCount = members.filter(member => member.status === 'pending').length
  const currentMember = activeGroup ? members.find(m => m.user_id === user.id) : null
  const activeNickname = currentMember?.nickname

  return (
    <main className="workspace">
      <aside className={`sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top"><div className="sidebar-kicker">YOUR SPACE</div></div>
        <div className="sidebar-actions"><button className="new-group-button" onClick={() => { setShowCreate(value => !value); setError('') }}><span>＋</span> Create a group</button></div>
        {showCreate && <form className="sidebar-form" onSubmit={createGroup}><label htmlFor="sidebar-group-name">Group name</label><input id="sidebar-group-name" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Weekend plans" maxLength={100} required /><label htmlFor="sidebar-join-policy">Who can join?</label><select id="sidebar-join-policy" value={joinPolicy} onChange={e => setJoinPolicy(e.target.value as 'open' | 'approval')}><option value="open">Anyone with the code</option><option value="approval">Admin approval</option></select><button className="button button-primary button-full" disabled={busy}>{busy ? 'Creating…' : 'Create group'}</button></form>}
        <form className="join-form" onSubmit={joinGroup}><label htmlFor="sidebar-invite-code">Join with an invite code</label><div className="join-row"><input id="sidebar-invite-code" autoComplete="off" maxLength={8} value={joinId} onChange={e => setJoinId(e.target.value.toUpperCase())} placeholder="8-character code" /><button aria-label="Join group" disabled={busy}>Join</button></div></form>
        <div className="sidebar-note"><span className="sidebar-note-mark">✳</span><strong>Your groups, together.</strong><p>Open a group from the main space to read and send messages.</p></div>
        <div className="sidebar-bottom">
          <button
            type="button"
            className={`profile-card profile-card-clickable ${sendAsAnonymous ? 'profile-card-anon' : ''}`}
            onClick={() => setSendAsAnonymous(v => !v)}
            title={sendAsAnonymous ? 'Currently texting as Anonymous. Click to switch to your name/nickname.' : 'Currently texting as yourself. Click to switch to Anonymous.'}
          >
            <span className={`avatar ${sendAsAnonymous ? 'avatar-anon' : ''}`}>
              {sendAsAnonymous ? (
                '🎭'
              ) : (
                <UserAvatar
                  avatarUrl={user.avatar_url}
                  fallback={activeNickname || user.nickname || user.first_name || user.username}
                />
              )}
            </span>
            <div className="profile-copy">
              <strong>{sendAsAnonymous ? 'Anonymous' : (activeNickname || user.nickname || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)}</strong>
              <small>{sendAsAnonymous ? '@anonymous · Incognito' : (activeNickname ? `Nick: ${activeNickname} · @${user.username}` : user.nickname ? `Nick: ${user.nickname} · @${user.username}` : `@${user.username}`)}</small>
            </div>
            <span className="profile-switch-badge">Switch ⇄</span>
          </button>
        </div>
      </aside>

      <section className="main-panel">
        {error && <div className="toast toast-error" role="alert"><span>!</span>{error}<button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}
        {notice && <div className="toast toast-success" role="status"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
        {activeGroup ? <>
          <header className="chat-header">
            <div className="group-avatar-wrapper">
              <div className="group-avatar tone-1 header-group-avatar">
                <GroupAvatar avatarUrl={activeGroup.avatar_url} name={activeGroup.name} />
              </div>
              {isAdmin && (
                <>
                  <input
                    ref={groupFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        e.target.value = ''
                        if (file.size > 10 * 1024 * 1024) {
                          setError('Group photo cannot exceed 10MB.')
                          return
                        }
                        setPendingHeaderPhoto(file)
                        setPendingHeaderPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="group-avatar-change-btn"
                    onClick={() => groupFileInputRef.current?.click()}
                    title="Change group photo from your PC"
                    aria-label="Change group photo from your PC"
                    disabled={savingGroupPhoto}
                  >
                    {savingGroupPhoto ? '…' : '📷'}
                  </button>
                </>
              )}
            </div>
            {pendingHeaderPhoto && (
              <div className="modal-backdrop" onClick={handleCancelHeaderPhoto}>
                <div className="photo-confirm-dialog" onClick={e => e.stopPropagation()}>
                  <div className="photo-confirm-header">
                    <h3>Change Group Photo</h3>
                    <button
                      type="button"
                      className="photo-confirm-close"
                      onClick={handleCancelHeaderPhoto}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <p className="photo-confirm-copy">
                    Preview of selected photo for <strong>{activeGroup.name}</strong>:
                  </p>
                  <div className="photo-confirm-preview-wrap">
                    <img src={pendingHeaderPreview!} alt="Selected Preview" className="photo-confirm-preview-img" />
                  </div>
                  <div className="photo-confirm-file-info">
                    <span>File: <strong>{pendingHeaderPhoto.name}</strong> ({Math.round(pendingHeaderPhoto.size / 1024)} KB)</span>
                  </div>
                  <div className="photo-confirm-actions">
                    <button
                      type="button"
                      className="button button-primary save-photo-btn"
                      onClick={() => void handleSaveHeaderPhoto()}
                      disabled={savingGroupPhoto}
                    >
                      💾 {savingGroupPhoto ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="outline-button"
                      onClick={handleCancelHeaderPhoto}
                      disabled={savingGroupPhoto}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {messageToDelete && (
              <div className="modal-backdrop" onClick={() => !deletingMessage && setMessageToDelete(null)}>
                <div className="photo-confirm-dialog" onClick={e => e.stopPropagation()}>
                  <div className="photo-confirm-header">
                    <h3>Delete message for everyone</h3>
                    <button
                      type="button"
                      className="photo-confirm-close"
                      onClick={() => setMessageToDelete(null)}
                      aria-label="Close"
                      disabled={deletingMessage}
                    >
                      ×
                    </button>
                  </div>
                  <p className="photo-confirm-copy">
                    Are you sure you want to permanently delete this message? It will be removed for everyone in <strong>{activeGroup.name}</strong>.
                  </p>
                  {messageToDelete.body && (
                    <div className="delete-message-preview">
                      “{messageToDelete.body.length > 140 ? messageToDelete.body.slice(0, 140) + '…' : messageToDelete.body}”
                    </div>
                  )}
                  {messageToDelete.image_url && (
                    <div className="delete-message-img-preview">
                      <img src={getMediaUrl(messageToDelete.image_url)} alt="Attachment preview" />
                    </div>
                  )}
                  <div className="photo-confirm-actions">
                    <button
                      type="button"
                      className="button button-danger delete-confirm-btn"
                      onClick={() => void handleDeleteMessage(messageToDelete)}
                      disabled={deletingMessage}
                    >
                      {deletingMessage ? 'Deleting…' : '🗑 Delete for everyone'}
                    </button>
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => setMessageToDelete(null)}
                      disabled={deletingMessage}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="chat-heading">
              {isEditingName ? (
                <form className="inline-rename-form" onSubmit={e => { e.preventDefault(); void updateGroupSettings(editName) }}>
                  <input
                    className="rename-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    maxLength={100}
                    autoFocus
                    placeholder="Group name"
                  />
                  <button className="button button-primary rename-save-btn" type="submit" disabled={renameBusy || !editName.trim()}>
                    {renameBusy ? '…' : 'Save'}
                  </button>
                  <button className="outline-button rename-cancel-btn" type="button" onClick={() => setIsEditingName(false)} disabled={renameBusy}>
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="chat-title-row">
                  <h1>{activeGroup.name}</h1>
                  {isAdmin && (
                    <button
                      className="edit-group-name-btn"
                      onClick={() => { setEditName(activeGroup.name); setIsEditingName(true) }}
                      title="Change group name"
                      aria-label="Change group name"
                    >
                      ✎
                    </button>
                  )}
                </div>
              )}
              <p>
                <span className="online-dot" />
                {members.filter(m => m.status === 'active' && (onlineUserIds.has(m.user_id) || m.user_id === user.id)).length > 0 && (
                  <strong className="online-active-label">
                    {members.filter(m => m.status === 'active' && (onlineUserIds.has(m.user_id) || m.user_id === user.id)).length} active now ·{' '}
                  </strong>
                )}
                {members.filter(member => member.status === 'active').length} members · Code {activeGroup.invite_code}
              </p>
            </div>
            <div className="chat-header-actions">
              <button className="outline-button back-groups-button" onClick={() => { setActiveGroup(null); setShowMembers(false); setNotice('') }}>‹ My groups</button>
              <button className={`outline-button ${showMembers ? 'pressed' : ''}`} onClick={() => setShowMembers(value => !value)}><span>♙</span> Members{pendingCount > 0 && <b className="pending-badge">{pendingCount}</b>}</button>
              <button className="icon-button header-more" onClick={() => { void navigator.clipboard?.writeText(activeGroup.invite_code); setNotice('Group invite code copied to clipboard.') }} aria-label="Copy group invite code">⧉</button>
            </div>
          </header>
          <div className="chat-area">
            {showMembers ? (
              <MemberPanel
                group={activeGroup}
                members={members}
                currentUserId={user.id}
                onlineUserIds={onlineUserIds}
                onApprove={approve}
                onRemove={removeMember}
                onLeave={leaveGroup}
                onUpdateGroup={updateGroupSettings}
                onUpdateNickname={updateMemberNickname}
                onUpdateRole={updateMemberRole}
                onUploadPhoto={uploadGroupPhoto}
                onRemovePhoto={removeGroupPhoto}
                photoBusy={savingGroupPhoto}
              />
            ) : (
              <>
                <div className="conversation-intro">
                  <div className="intro-mark">✳</div>
                  <h2>You’re in {activeGroup.name}</h2>
                  <p>Start the conversation. Everything shared here stays with the group.</p>
                </div>
                {loadingMessages && messages.length === 0 ? (
                  <div className="chat-loading">
                    <span className="spinner" />
                    Loading conversation…
                  </div>
                ) : (
                  <div className="message-list">
                    {messages.map((message, index) => {
                      const prevMessage = index > 0 ? messages[index - 1] : null
                      const showDateDivider =
                        !prevMessage ||
                        getMessageDateKey(message.created_at) !== getMessageDateKey(prevMessage.created_at)

                      return (
                        <Fragment key={message.id}>
                          {showDateDivider && (
                            <div className="date-divider" role="separator" aria-label={formatChatDateDivider(message.created_at)}>
                              <span>{formatChatDateDivider(message.created_at)}</span>
                            </div>
                          )}
                          <MessageBubble
                            message={message}
                            own={message.sender_id === user.id}
                            canDelete={message.sender_id === user.id || isAdmin}
                            onDelete={setMessageToDelete}
                            onEdit={handleEditMessage}
                            currentUsername={user.username}
                          />
                        </Fragment>
                      )
                    })}
                    {Object.keys(typingUsers).length > 0 && (
                      <div className="typing-indicator-container">
                        {Object.entries(typingUsers).map(([idStr, tUser]) => (
                          <article className="message-row typing-row" key={idStr}>
                            <div className={`message-avatar ${tUser.is_anonymous ? 'avatar-anon-bubble' : ''}`}>
                              {tUser.is_anonymous ? (
                                '🎭'
                              ) : (
                                <UserAvatar avatarUrl={tUser.avatar_url} fallback={tUser.name} />
                              )}
                            </div>
                            <div className="message-content">
                              <div className="typing-bubble" title={`${tUser.name} is typing…`}>
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                              </div>
                              <span className="typing-status-text">
                                {tUser.name} is typing…
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
                {chatError && (
                  <div className="chat-error" role="alert">
                    {chatError}
                    <button onClick={() => setChatError('')}>Dismiss</button>
                  </div>
                )}
              </>
            )}
          </div>
          {!showMembers && (
            <form className={`composer ${sendAsAnonymous ? 'composer-anon' : ''}`} onSubmit={sendMessage}>
              {attachedPreview && (
                <div className="composer-attachment-preview">
                  <img src={attachedPreview} alt="Attached preview" className="composer-preview-thumb" />
                  <div className="composer-preview-details">
                    <strong>{attachedImage?.name}</strong>
                    <small>{attachedImage ? (attachedImage.size / 1024).toFixed(0) : 0} KB · Ready to share</small>
                  </div>
                  <button
                    type="button"
                    className="composer-remove-attachment"
                    onClick={clearAttachedImage}
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              )}
              {mentionQuery !== null && mentionCandidates.length > 0 && (
                <div className="mention-dropdown-menu" role="listbox">
                  <div className="mention-dropdown-header">Group Members</div>
                  {mentionCandidates.slice(0, 6).map((m, idx) => {
                    const name = m.nickname || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.username
                    return (
                      <button
                        key={m.user_id}
                        type="button"
                        className={`mention-candidate-item ${idx === mentionIndex ? 'active' : ''}`}
                        onClick={() => insertMention(m)}
                        onMouseEnter={() => setMentionIndex(idx)}
                      >
                        <UserAvatar avatarUrl={m.avatar_url} fallback={name} size={28} />
                        <div className="mention-candidate-info">
                          <span className="mention-candidate-name">{name}</span>
                          <span className="mention-candidate-username">@{m.username}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="composer-main-row">
                <input
                  ref={chatImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleChatImageSelect}
                />
                <button
                  type="button"
                  className="attach-button"
                  onClick={() => chatImageInputRef.current?.click()}
                  title="Share an image from your device"
                  aria-label="Share image"
                >
                  📷
                </button>
                <textarea
                  ref={composerTextareaRef}
                  rows={1}
                  value={messageText}
                  onChange={e => handleComposerInput(e.target.value)}
                  onClick={() => checkMentionTrigger(messageText)}
                  onKeyUp={() => checkMentionTrigger(messageText)}
                  onBlur={() => {
                    setTimeout(() => {
                      setMentionQuery(null)
                    }, 200)
                    sendTypingEvent(false)
                  }}
                  onKeyDown={onComposerKeyDown}
                  placeholder={
                    attachedImage
                      ? `Add a caption for this photo…`
                      : sendAsAnonymous
                      ? `Message ${activeGroup.name} as Anonymous…`
                      : `Message ${activeGroup.name}…`
                  }
                  maxLength={10000}
                />
                <span className="composer-hint">
                  {sendAsAnonymous
                    ? '🎭 Posting as Anonymous · Identity hidden from members'
                    : 'Enter to send · Shift + Enter for a new line'}
                </span>
                <button
                  type="button"
                  className="emoji-button"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  aria-label="Insert emoji"
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    {emojiList.map(e => (
                      <button
                        key={e}
                        type="button"
                        className="emoji-item"
                        onClick={() => {
                          setMessageText(prev => prev + e)
                          setShowEmojiPicker(false)
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="send-button"
                  aria-label="Send message"
                  disabled={busy || (!messageText.trim() && !attachedImage)}
                >
                  ↑
                </button>
              </div>
            </form>
          )}
        </> : <WelcomePanel groups={groups} unreadGroups={unreadGroups} loadingGroups={loadingGroups} onSelectGroup={group => { setActiveGroup(group); setShowMembers(false); setNotice('') }} />}
      </section>
    </main>
  )
}

function renderFormattedBody(text: string, currentUsername: string) {
  const parts = text.split(/(@[a-zA-Z0-9_.-]+)/g)
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.slice(1)
      const isMe = username.toLowerCase() === currentUsername.toLowerCase()
      return (
        <span
          key={index}
          className={`mention-pill ${isMe ? 'mention-pill-me' : ''}`}
          title={isMe ? 'You were mentioned' : `@${username}`}
        >
          {part}
        </span>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function MessageBubble({
  message,
  own,
  canDelete,
  onDelete,
  onEdit,
  currentUsername = '',
}: {
  message: Message
  own: boolean
  canDelete?: boolean
  onDelete?: (message: Message) => void
  onEdit?: (messageId: number, newBody: string) => Promise<void>
  currentUsername?: string
}) {
  const [showStatusDetails, setShowStatusDetails] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(message.body || '')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  const time = new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const isAnon = Boolean(message.is_anonymous)
  const status = message.status || 'sent'
  const seenUsers = message.seen_by || []

  // Messenger-style recent edit window (15 minutes)
  const messageAgeMinutes = (Date.now() - new Date(message.created_at).getTime()) / (1000 * 60)
  const canEdit = own && message.message_type === 'text' && message.id > 0 && messageAgeMinutes <= 15

  async function handleSaveEdit() {
    const trimmed = editDraft.trim()
    if (!trimmed || trimmed === message.body || !onEdit) {
      setIsEditing(false)
      return
    }
    setIsSavingEdit(true)
    setEditError('')
    try {
      await onEdit(message.id, trimmed)
      setIsEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSavingEdit(false)
    }
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsEditing(false)
      setEditDraft(message.body || '')
      setEditError('')
    }
  }

  const seenText =
    seenUsers.length > 0
      ? `Seen by ${seenUsers.map(u => u.name).join(', ')}`
      : status === 'delivered'
      ? 'Delivered'
      : status === 'sent'
      ? 'Sent'
      : 'Sending…'

  const isMentionedMe = Boolean(
    !own &&
    message.body &&
    currentUsername &&
    new RegExp(`@${currentUsername}\\b`, 'i').test(message.body)
  )

  return (
    <article className={`message-row ${own ? 'message-own' : ''} ${isAnon ? 'message-anon' : ''} ${isMentionedMe ? 'message-row-mentioned' : ''}`}>
      <div className={`message-avatar ${own ? 'my-message-avatar' : ''} ${isAnon ? 'avatar-anon-bubble' : ''}`}>
        {isAnon ? (
          '🎭'
        ) : (
          <UserAvatar
            avatarUrl={message.sender_avatar_url}
            fallback={message.sender_name}
          />
        )}
      </div>
      <div className="message-content">
        <div className="message-meta">
          <strong>
            {isAnon ? (own ? 'You (Anonymous)' : 'Anonymous') : (own ? `${message.sender_name} (You)` : message.sender_name)}
          </strong>
          <small>{isAnon ? '@anonymous' : (!own ? `@${message.sender_username}` : '')}</small>
          {isAnon && <span className="anon-tag">Anonymous</span>}
          {isMentionedMe && <span className="mentioned-badge" title="You were mentioned in this message">@ Mentioned you</span>}
          <time>{time}</time>
          {message.is_edited && (
            <span
              className="edited-tag"
              title={message.edited_at ? `Edited at ${new Date(message.edited_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Edited'}
            >
              · Edited
            </span>
          )}
        </div>
        <div className="message-bubble-wrap">
          {isEditing ? (
            <div className="message-edit-box">
              <textarea
                value={editDraft}
                onChange={e => setEditDraft(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="message-edit-input"
                autoFocus
                disabled={isSavingEdit}
                rows={Math.max(1, Math.min(6, editDraft.split('\n').length))}
              />
              {editError && <span className="edit-error-text">{editError}</span>}
              <div className="message-edit-actions">
                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={() => {
                    setIsEditing(false)
                    setEditDraft(message.body || '')
                    setEditError('')
                  }}
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="edit-save-btn"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editDraft.trim() || editDraft.trim() === message.body}
                >
                  {isSavingEdit ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`message-bubble ${own ? 'bubble-own' : ''} ${isAnon ? 'bubble-anon' : ''}`}
              onClick={() => own && setShowStatusDetails(v => !v)}
              title={own ? `Click to toggle status: ${seenText}` : undefined}
              style={{ cursor: own ? 'pointer' : 'default' }}
            >
              {message.message_type === 'image' && message.image_url && (
                <div className="message-image-wrap">
                  <img
                    src={getMediaUrl(message.image_url)}
                    alt="Shared attachment"
                    className="message-shared-image"
                    onClick={e => {
                      e.stopPropagation()
                      window.open(getMediaUrl(message.image_url), '_blank')
                    }}
                    title="Click to view full image"
                  />
                </div>
              )}
              {message.body && (
                <div className="message-text-body">
                  {renderFormattedBody(message.body, currentUsername)}
                </div>
              )}
            </div>
          )}

          {!isEditing && (
            <div className="msg-actions-group">
              {canEdit && (
                <button
                  type="button"
                  className="msg-action-btn msg-edit-action-btn"
                  onClick={e => {
                    e.stopPropagation()
                    setIsEditing(true)
                    setEditDraft(message.body || '')
                    setEditError('')
                  }}
                  title="Edit message (within 15 min)"
                  aria-label="Edit message"
                >
                  ✎
                </button>
              )}
              {canDelete && onDelete && message.id > 0 && (
                <button
                  type="button"
                  className="msg-action-btn msg-delete-action-btn"
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(message)
                  }}
                  title="Delete message for everyone"
                  aria-label="Delete message for everyone"
                >
                  🗑
                </button>
              )}
            </div>
          )}
        </div>

        {own && (
          <div
            className="message-delivery-footer"
            onClick={() => setShowStatusDetails(v => !v)}
            title={seenText}
          >
            {showStatusDetails && (
              <span className="delivery-status-text">
                {status === 'sending' && 'Sending…'}
                {status === 'sent' && 'Sent'}
                {status === 'delivered' && 'Delivered'}
                {status === 'seen' && (
                  seenUsers.length === 1
                    ? `Seen by ${seenUsers[0].name}`
                    : `Seen by ${seenUsers.length} members`
                )}
              </span>
            )}

            {/* Messenger-style status icons */}
            {status === 'sending' && (
              <span className="messenger-status-icon messenger-sending" aria-label="Sending" title="Sending…">
                <svg viewBox="0 0 16 16" width="13" height="13">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" fill="none" />
                </svg>
              </span>
            )}

            {status === 'sent' && (
              <span className="messenger-status-icon messenger-sent" aria-label="Sent" title="Sent">
                <svg viewBox="0 0 16 16" width="13" height="13">
                  <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" fill="none" />
                  <path d="M4.6 8.2l2.3 2.3 4.5-4.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </span>
            )}

            {status === 'delivered' && (
              <span className="messenger-status-icon messenger-delivered" aria-label="Delivered" title="Delivered">
                <svg viewBox="0 0 16 16" width="13" height="13">
                  <circle cx="8" cy="8" r="7" fill="#3a82f7" />
                  <path d="M4.6 8.2l2.3 2.3 4.5-4.6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </span>
            )}

            {status === 'seen' && (
              <span className="messenger-seen-avatars" title={seenText}>
                {seenUsers.slice(0, 3).map((u, i) => (
                  <span
                    key={u.user_id}
                    className="messenger-mini-avatar"
                    style={{ zIndex: 3 - i }}
                    title={`${u.name} seen`}
                  >
                    <UserAvatar avatarUrl={u.avatar_url} fallback={u.name} size={14} />
                  </span>
                ))}
                {seenUsers.length === 0 && (
                  <span className="messenger-status-icon messenger-delivered" title="Seen">
                    <svg viewBox="0 0 16 16" width="13" height="13">
                      <circle cx="8" cy="8" r="7" fill="#31a24c" />
                      <path d="M4.6 8.2l2.3 2.3 4.5-4.6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function MemberPanel({
  group,
  members,
  currentUserId,
  onlineUserIds,
  onApprove,
  onRemove,
  onLeave,
  onUpdateGroup,
  onUpdateNickname,
  onUpdateRole,
  onUploadPhoto,
  onRemovePhoto,
  photoBusy,
}: {
  group: Group
  members: Member[]
  currentUserId: number
  onlineUserIds: Set<number>
  onApprove: (member: Member) => void
  onRemove: (member: Member) => void
  onLeave: () => void
  onUpdateGroup: (name: string, policy?: Group['join_policy']) => Promise<void>
  onUpdateNickname: (member: Member, nickname: string | null) => Promise<void>
  onUpdateRole?: (member: Member, role: Member['role']) => Promise<void>
  onUploadPhoto?: (file: File) => Promise<void>
  onRemovePhoto?: () => Promise<void>
  photoBusy?: boolean
}) {
  const activeMembers = members.filter(member => member.status === 'active')
  const pending = members.filter(member => member.status === 'pending')
  const isAdmin = group.owner_id === currentUserId || members.some(member => member.user_id === currentUserId && member.role === 'admin' && member.status === 'active')
  const displayName = (member: Member) => [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username

  const [panelName, setPanelName] = useState(group.name)
  const [panelPolicy, setPanelPolicy] = useState<Group['join_policy']>(group.join_policy)
  const [panelBusy, setPanelBusy] = useState(false)
  const [editingNickUserId, setEditingNickUserId] = useState<number | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')
  const [nickBusy, setNickBusy] = useState(false)
  const [pendingPanelFile, setPendingPanelFile] = useState<File | null>(null)
  const [pendingPanelPreview, setPendingPanelPreview] = useState<string | null>(null)
  const panelFileInputRef = useRef<HTMLInputElement | null>(null)

  function handlePanelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 10 * 1024 * 1024) {
      alert('Group photo cannot exceed 10MB.')
      return
    }
    setPendingPanelFile(file)
    setPendingPanelPreview(URL.createObjectURL(file))
  }

  async function handleSavePanelPhoto() {
    if (!pendingPanelFile || !onUploadPhoto) return
    try {
      await onUploadPhoto(pendingPanelFile)
      setPendingPanelFile(null)
      setPendingPanelPreview(null)
    } catch {
      // error handled upstream
    }
  }

  function handleCancelPanelPhoto() {
    setPendingPanelFile(null)
    setPendingPanelPreview(null)
  }

  useEffect(() => {
    setPanelName(group.name)
    setPanelPolicy(group.join_policy)
  }, [group.name, group.join_policy])

  async function handleSaveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!panelName.trim()) return
    setPanelBusy(true)
    try {
      await onUpdateGroup(panelName.trim(), panelPolicy)
    } finally {
      setPanelBusy(false)
    }
  }

  function startEditNickname(member: Member) {
    setEditingNickUserId(member.user_id)
    setNicknameInput(member.nickname || '')
  }

  async function submitNickname(member: Member, val: string | null) {
    setNickBusy(true)
    try {
      await onUpdateNickname(member, val)
      setEditingNickUserId(null)
    } finally {
      setNickBusy(false)
    }
  }

  return (
    <div className="members-panel">
      <div className="members-title">
        <div>
          <p className="eyebrow">YOUR CIRCLE</p>
          <h2>Group details & members</h2>
          <p>{activeMembers.length} people in this group</p>
        </div>
        <div className="members-title-actions">
          <span className="member-count-large">{activeMembers.length}</span>
          <button className="leave-group-button" onClick={onLeave}>Leave group</button>
        </div>
      </div>

      {isAdmin && (
        <section className="group-settings-section">
          <div className="member-section-label">GROUP SETTINGS (ADMIN)</div>
          <div className="settings-field">
            <label>Group photo</label>
            <div className="group-photo-card">
              <div className="group-photo-preview">
                <GroupAvatar avatarUrl={pendingPanelPreview || group.avatar_url} name={group.name} size={58} />
              </div>
              <div className="group-photo-actions">
                <input
                  ref={panelFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handlePanelFileChange}
                />
                {pendingPanelFile ? (
                  <>
                    <div className="group-photo-btn-row">
                      <button
                        type="button"
                        className="button button-primary button-sm save-photo-btn"
                        onClick={() => void handleSavePanelPhoto()}
                        disabled={photoBusy}
                      >
                        💾 {photoBusy ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="outline-button button-sm"
                        onClick={handleCancelPanelPhoto}
                        disabled={photoBusy}
                      >
                        Cancel
                      </button>
                    </div>
                    <span className="pending-photo-hint">
                      Photo selected: <strong>{pendingPanelFile.name}</strong>. Click <b>Save</b> to apply.
                    </span>
                  </>
                ) : (
                  <>
                    <div className="group-photo-btn-row">
                      <button
                        type="button"
                        className="button button-primary button-sm"
                        onClick={() => panelFileInputRef.current?.click()}
                        disabled={photoBusy}
                      >
                        📷 Choose photo from PC
                      </button>
                      {group.avatar_url && onRemovePhoto && (
                        <button
                          type="button"
                          className="outline-button button-sm"
                          onClick={() => void onRemovePhoto()}
                          disabled={photoBusy}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                    <span className="group-photo-hint">Admins can upload any JPG, PNG, WebP or GIF from their PC (up to 10MB).</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <form className="rename-group-form" onSubmit={handleSaveSettings}>
            <div className="settings-field">
              <label htmlFor="member-panel-group-name">Group name</label>
              <input
                id="member-panel-group-name"
                value={panelName}
                onChange={e => setPanelName(e.target.value)}
                maxLength={100}
                placeholder="Group name"
                required
              />
            </div>
            <div className="settings-field">
              <label htmlFor="member-panel-join-policy">Who can join?</label>
              <select
                id="member-panel-join-policy"
                value={panelPolicy}
                onChange={e => setPanelPolicy(e.target.value as Group['join_policy'])}
              >
                <option value="open">Anyone with the code</option>
                <option value="approval">Admin approval</option>
              </select>
            </div>
            <button
              className="button button-primary"
              type="submit"
              disabled={panelBusy || !panelName.trim() || (panelName.trim() === group.name && panelPolicy === group.join_policy)}
            >
              {panelBusy ? 'Saving changes…' : 'Save group settings'}
            </button>
          </form>
        </section>
      )}

      {isAdmin && pending.length > 0 && (
        <section className="pending-section">
          <div className="member-section-label">WAITING FOR APPROVAL <span>{pending.length}</span></div>
          {pending.map(member => (
            <div className="member-line" key={member.user_id}>
              <span className="avatar">
                <UserAvatar avatarUrl={member.avatar_url} fallback={displayName(member)} />
              </span>
              <div className="member-info">
                <strong>{displayName(member)}</strong>
                <small>@{member.username} · Requested to join</small>
              </div>
              <button className="approve-button" onClick={() => onApprove(member)}>Approve</button>
              <button className="remove-member-button" onClick={() => onRemove(member)}>Remove</button>
            </div>
          ))}
        </section>
      )}

      <section className="active-members">
        <div className="member-section-label">MEMBERS ({activeMembers.length})</div>
        {activeMembers.map(member => {
          const isEditingThis = editingNickUserId === member.user_id
          const hasNickname = Boolean(member.nickname)
          const isSelf = member.user_id === currentUserId
          const memberAvatar = member.avatar_url
          const isOnline = onlineUserIds.has(member.user_id) || isSelf

          return (
            <div className="member-line" key={member.user_id}>
              <span className="avatar">
                <UserAvatar
                  avatarUrl={memberAvatar}
                  fallback={member.nickname || displayName(member)}
                  isOnline={isOnline}
                />
              </span>
              <div className="member-info">
                <div className="member-info-header">
                  <strong>{member.nickname || displayName(member)}</strong>
                  {isOnline ? (
                    <span className="online-badge-pill" title="Active now">
                      <span className="online-green-dot" /> Active now
                    </span>
                  ) : (
                    <span
                      className="last-seen-badge"
                      title={member.last_seen_at ? `Last active: ${new Date(member.last_seen_at).toLocaleString()}` : 'Offline'}
                    >
                      {formatLastSeen(member.last_seen_at)}
                    </span>
                  )}
                  {hasNickname && <span className="nickname-tag">Nickname</span>}
                  {member.role === 'admin' && <span className="admin-pill" title="Group Admin">ADMIN</span>}
                  {member.role === 'moderator' && <span className="mod-pill" title="Group Moderator">MODERATOR</span>}
                  {member.role === 'contributor' && <span className="contrib-pill" title="Contributor">CONTRIBUTOR</span>}
                  {isSelf && <span className="you-pill">YOU</span>}
                </div>
                <small>
                  {hasNickname ? `${displayName(member)} (@${member.username})` : `@${member.username}`}
                  {` · ${member.role === 'admin' ? 'Group admin' : member.role === 'moderator' ? 'Group moderator' : member.role === 'contributor' ? 'Contributor' : 'Member'}`}
                </small>

                {isEditingThis && (
                  <form
                    className="member-nick-edit-form"
                    onSubmit={e => {
                      e.preventDefault()
                      void submitNickname(member, nicknameInput.trim() || null)
                    }}
                  >
                    <input
                      type="text"
                      className="member-nick-input"
                      value={nicknameInput}
                      onChange={e => setNicknameInput(e.target.value)}
                      placeholder={`Nickname for ${displayName(member)}`}
                      maxLength={64}
                      autoFocus
                      disabled={nickBusy}
                    />
                    <button type="submit" className="button button-primary button-sm" disabled={nickBusy}>
                      Save
                    </button>
                    {hasNickname && (
                      <button
                        type="button"
                        className="outline-button button-sm"
                        onClick={() => void submitNickname(member, null)}
                        disabled={nickBusy}
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      className="outline-button button-sm"
                      onClick={() => setEditingNickUserId(null)}
                      disabled={nickBusy}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {!isEditingThis && (
                <div className="member-line-actions">
                  {isAdmin && onUpdateRole && !isSelf && member.user_id !== group.owner_id && (
                    <select
                      className="member-role-select"
                      value={member.role}
                      onChange={e => onUpdateRole(member, e.target.value as Member['role'])}
                      title="Assign group role"
                    >
                      <option value="admin">🛡️ Admin</option>
                      <option value="moderator">⚔️ Moderator</option>
                      <option value="contributor">⭐ Contributor</option>
                      <option value="member">👤 Member</option>
                    </select>
                  )}
                  <button
                    type="button"
                    className="nickname-action-button"
                    onClick={() => startEditNickname(member)}
                    title={hasNickname ? 'Change nickname' : 'Set nickname'}
                  >
                    ✎ {hasNickname ? 'Change Nick' : 'Set Nick'}
                  </button>
                  {isAdmin && member.user_id !== currentUserId && (
                    <button className="remove-member-button" onClick={() => onRemove(member)}>
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>
      <div className="invite-note">
        <span>ⓘ</span>
        <p>Invite someone by sharing invite code <strong>{group.invite_code}</strong>. They can enter it from their Groups panel.</p>
      </div>
    </div>
  )
}

function WelcomePanel({ groups, unreadGroups, loadingGroups, onSelectGroup }: { groups: Group[]; unreadGroups: Record<number, number>; loadingGroups: boolean; onSelectGroup: (group: Group) => void }) {
  return <div className="dashboard"><div className="dashboard-heading"><div><p className="eyebrow">A PLACE FOR YOUR PEOPLE</p><h1>Your groups</h1><p>Pick up a conversation or bring your people together.</p></div></div>
    <div className="dashboard-section-title"><h2>My groups</h2><span>{groups.length}</span></div>
    {loadingGroups ? <div className="dashboard-empty"><span className="spinner" />Loading groups…</div> : groups.length ? <div className="dashboard-group-grid">{groups.map((group, index) => <button key={group.id} className={`dashboard-group-card tone-card-${index % 5} ${unreadGroups[group.id] ? 'group-unread' : ''}`} onClick={() => onSelectGroup(group)}><span className={`group-avatar tone-${index % 5}`}><GroupAvatar avatarUrl={group.avatar_url} name={group.name} /></span><span className="dashboard-group-info"><strong>{group.name}</strong><small>Invite code · <b>{group.invite_code}</b></small><small>{group.join_policy === 'open' ? 'Open group' : 'Admin approval'}</small></span>{unreadGroups[group.id] ? <span className="group-unread-count">{unreadGroups[group.id] > 99 ? '99+' : unreadGroups[group.id]}</span> : <span className="dashboard-card-arrow">↗</span>}</button>)}</div> : <div className="dashboard-empty"><span className="empty-mark">✳</span><strong>No groups yet</strong><p>Create your first group or join one with an invite code.</p></div>}
  </div>
}

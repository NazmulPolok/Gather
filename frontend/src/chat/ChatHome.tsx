import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { api, type Group, type Member, type Message, type NotificationItem } from '../api/client'

type CurrentUser = { id: number; email: string; first_name: string; last_name: string; username: string }

export function ChatHome({ token, user, notificationTarget, onNotificationHandled, unreadGroups, onUnreadGroups }: { token: string; user: CurrentUser; notificationTarget: NotificationItem | null; onNotificationHandled: () => void; unreadGroups: Record<number, number>; onUnreadGroups: (counts: Record<number, number>) => void }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [messageText, setMessageText] = useState('')
  const [groupName, setGroupName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [joinPolicy, setJoinPolicy] = useState<'open' | 'approval'>('open')
  const [busy, setBusy] = useState(false);
  const [sendAsAnonymous, setSendAsAnonymous] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiList = ['😀','😂','🥰','👍','🎉','❤️','🚀','👎','😢','😎'];
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [renameBusy, setRenameBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [chatError, setChatError] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
      setMessages(result)
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

  useEffect(() => {
    if (!activeGroup || !unreadGroups[activeGroup.id]) return
    const groupId = activeGroup.id
    void api.markGroupMessagesRead(token, groupId).then(() => {
      const next = { ...unreadGroups }
      delete next[groupId]
      onUnreadGroups(next)
    }).catch(() => undefined)
  }, [activeGroup?.id, token, unreadGroups, onUnreadGroups])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages.length, activeGroup?.id])

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

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = messageText.trim()
    if (!activeGroup || !body || busy) return
    setBusy(true); setChatError('')
    try { const sent = await api.sendText(token, activeGroup.id, body, sendAsAnonymous); setMessages(current => [...current, sent]); setMessageText('') }
    catch (cause) { setChatError(cause instanceof Error ? cause.message : 'Message could not be sent') }
    finally { setBusy(false) }
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

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() }
  }

  const pendingCount = members.filter(member => member.status === 'pending').length

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
            title={sendAsAnonymous ? 'Currently texting as Anonymous. Click to switch to your real name.' : 'Currently texting as yourself. Click to switch to Anonymous.'}
          >
            <span className={`avatar ${sendAsAnonymous ? 'avatar-anon' : ''}`}>
              {sendAsAnonymous ? '🎭' : (user.first_name || user.username).slice(0, 1).toUpperCase()}
            </span>
            <div className="profile-copy">
              <strong>{sendAsAnonymous ? 'Anonymous' : ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)}</strong>
              <small>{sendAsAnonymous ? '@anonymous · Incognito' : `@${user.username}`}</small>
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
            <div className="group-avatar tone-1 header-group-avatar">{activeGroup.name.slice(0, 1).toUpperCase()}</div>
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
              <p><span className="online-dot" />{members.filter(member => member.status === 'active').length} members · Code {activeGroup.invite_code}</p>
            </div>
            <div className="chat-header-actions">
              <button className="outline-button back-groups-button" onClick={() => { setActiveGroup(null); setShowMembers(false); setNotice('') }}>‹ My groups</button>
              <button className={`outline-button ${showMembers ? 'pressed' : ''}`} onClick={() => setShowMembers(value => !value)}><span>♙</span> Members{pendingCount > 0 && <b className="pending-badge">{pendingCount}</b>}</button>
              <button className="icon-button header-more" onClick={() => { void navigator.clipboard?.writeText(activeGroup.invite_code); setNotice('Group invite code copied to clipboard.') }} aria-label="Copy group invite code">⧉</button>
            </div>
          </header>
          <div className="chat-area">
            {showMembers ? <MemberPanel group={activeGroup} members={members} currentUserId={user.id} onApprove={approve} onRemove={removeMember} onLeave={leaveGroup} onUpdateGroup={updateGroupSettings} /> : <>
              <div className="conversation-intro"><div className="intro-mark">✳</div><h2>You’re in {activeGroup.name}</h2><p>Start the conversation. Everything shared here stays with the group.</p><span className="date-divider">TODAY</span></div>
              {loadingMessages && messages.length === 0 ? <div className="chat-loading"><span className="spinner" />Loading conversation…</div> : <div className="message-list">{messages.map(message => <MessageBubble key={message.id} message={message} own={message.sender_id === user.id} />)}<div ref={bottomRef} /></div>}
              {chatError && <div className="chat-error" role="alert">{chatError}<button onClick={() => setChatError('')}>Dismiss</button></div>}
            </>}
          </div>
          {!showMembers && (
            <form className={`composer ${sendAsAnonymous ? 'composer-anon' : ''}`} onSubmit={sendMessage}>
              <textarea
                rows={1}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder={sendAsAnonymous ? `Message ${activeGroup.name} as Anonymous…` : `Message ${activeGroup.name}…`}
                maxLength={10000}
              />
              <span className="composer-hint">
                {sendAsAnonymous ? '🎭 Posting as Anonymous · Identity hidden from members' : 'Text only · Enter to send · Shift + Enter for a new line'}
              </span>
              <button type="button" className="emoji-button" onClick={() => setShowEmojiPicker(v => !v)} aria-label="Insert emoji">😊</button>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojiList.map(e => (
                    <button key={e} type="button" className="emoji-item" onClick={() => { setMessageText(prev => prev + e); setShowEmojiPicker(false); }}>{e}</button>
                  ))}
                </div>
              )}
              <button className="send-button" aria-label="Send message" disabled={busy || !messageText.trim()}>↑</button>
            </form>
          )}
        </> : <WelcomePanel groups={groups} unreadGroups={unreadGroups} loadingGroups={loadingGroups} onSelectGroup={group => { setActiveGroup(group); setShowMembers(false); setNotice('') }} />}
      </section>
    </main>
  )
}

function MessageBubble({ message, own }: { message: Message; own: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const isAnon = Boolean(message.is_anonymous)

  return (
    <article className={`message-row ${own ? 'message-own' : ''} ${isAnon ? 'message-anon' : ''}`}>
      <div className={`message-avatar ${own ? 'my-message-avatar' : ''} ${isAnon ? 'avatar-anon-bubble' : ''}`}>
        {isAnon ? '🎭' : (own ? 'Y' : message.sender_name.slice(0, 1)).toUpperCase()}
      </div>
      <div className="message-content">
        <div className="message-meta">
          <strong>{own ? (isAnon ? 'You (Anonymous)' : 'You') : message.sender_name}</strong>
          <small>{isAnon ? '@anonymous' : (!own ? `@${message.sender_username}` : '')}</small>
          {isAnon && <span className="anon-tag">Anonymous</span>}
          <time>{time}</time>
        </div>
        <div className={`message-bubble ${own ? 'bubble-own' : ''} ${isAnon ? 'bubble-anon' : ''}`}>
          {message.body}
        </div>
      </div>
    </article>
  )
}

function MemberPanel({ group, members, currentUserId, onApprove, onRemove, onLeave, onUpdateGroup }: { group: Group; members: Member[]; currentUserId: number; onApprove: (member: Member) => void; onRemove: (member: Member) => void; onLeave: () => void; onUpdateGroup: (name: string, policy?: Group['join_policy']) => Promise<void> }) {
  const activeMembers = members.filter(member => member.status === 'active')
  const pending = members.filter(member => member.status === 'pending')
  const isAdmin = group.owner_id === currentUserId || members.some(member => member.user_id === currentUserId && member.role === 'admin' && member.status === 'active')
  const displayName = (member: Member) => [member.first_name, member.last_name].filter(Boolean).join(' ') || member.username

  const [panelName, setPanelName] = useState(group.name)
  const [panelPolicy, setPanelPolicy] = useState<Group['join_policy']>(group.join_policy)
  const [panelBusy, setPanelBusy] = useState(false)

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

  return <div className="members-panel">
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

    {isAdmin && pending.length > 0 && <section className="pending-section"><div className="member-section-label">WAITING FOR APPROVAL <span>{pending.length}</span></div>{pending.map(member => <div className="member-line" key={member.user_id}><span className="avatar">{displayName(member).slice(0, 1).toUpperCase()}</span><div className="member-info"><strong>{displayName(member)}</strong><small>@{member.username} · Requested to join</small></div><button className="approve-button" onClick={() => onApprove(member)}>Approve</button><button className="remove-member-button" onClick={() => onRemove(member)}>Remove</button></div>)}</section>}
    <section className="active-members"><div className="member-section-label">MEMBERS</div>{activeMembers.map(member => <div className="member-line" key={member.user_id}><span className="avatar">{displayName(member).slice(0, 1).toUpperCase()}</span><div className="member-info"><strong>{displayName(member)}</strong><small>@{member.username} · {member.role === 'admin' ? 'Group admin' : 'Member'}{member.user_id === currentUserId ? ' · You' : ''}</small></div>{member.role === 'admin' && <span className="admin-pill">ADMIN</span>}{isAdmin && member.user_id !== currentUserId && <button className="remove-member-button" onClick={() => onRemove(member)}>Remove</button>}</div>)}</section>
    <div className="invite-note"><span>ⓘ</span><p>Invite someone by sharing invite code <strong>{group.invite_code}</strong>. They can enter it from their Groups panel.</p></div>
  </div>
}

function WelcomePanel({ groups, unreadGroups, loadingGroups, onSelectGroup }: { groups: Group[]; unreadGroups: Record<number, number>; loadingGroups: boolean; onSelectGroup: (group: Group) => void }) {
  return <div className="dashboard"><div className="dashboard-heading"><div><p className="eyebrow">A PLACE FOR YOUR PEOPLE</p><h1>Your groups</h1><p>Pick up a conversation or bring your people together.</p></div></div>
    <div className="dashboard-section-title"><h2>My groups</h2><span>{groups.length}</span></div>
    {loadingGroups ? <div className="dashboard-empty"><span className="spinner" />Loading groups…</div> : groups.length ? <div className="dashboard-group-grid">{groups.map((group, index) => <button key={group.id} className={`dashboard-group-card tone-card-${index % 5} ${unreadGroups[group.id] ? 'group-unread' : ''}`} onClick={() => onSelectGroup(group)}><span className={`group-avatar tone-${index % 5}`}>{group.name.slice(0, 1).toUpperCase()}</span><span className="dashboard-group-info"><strong>{group.name}</strong><small>Invite code · <b>{group.invite_code}</b></small><small>{group.join_policy === 'open' ? 'Open group' : 'Admin approval'}</small></span>{unreadGroups[group.id] ? <span className="group-unread-count">{unreadGroups[group.id] > 99 ? '99+' : unreadGroups[group.id]}</span> : <span className="dashboard-card-arrow">↗</span>}</button>)}</div> : <div className="dashboard-empty"><span className="empty-mark">✳</span><strong>No groups yet</strong><p>Create your first group or join one with an invite code.</p></div>}
  </div>
}

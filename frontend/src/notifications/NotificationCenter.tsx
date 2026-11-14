import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { api, type NotificationFeed, type NotificationItem } from '../api/client'

const EMPTY_FEED: NotificationFeed = { items: [], unread_count: 0 }

export function NotificationCenter({ token, onSelect, onUnreadGroups }: { token: string; onSelect: (item: NotificationItem) => void; onUnreadGroups: (counts: Record<number, number>) => void }) {
  const [feed, setFeed] = useState<NotificationFeed>(EMPTY_FEED)
  const [open, setOpen] = useState(false)
  const [problem, setProblem] = useState('')
  const [liveAlert, setLiveAlert] = useState<NotificationItem | null>(null)
  const [respondingId, setRespondingId] = useState<number | null>(null)
  const loadedOnce = useRef(false)
  const seenIds = useRef(new Set<number>())
  const alertTimer = useRef<number | undefined>(undefined)

  const refresh = useCallback(async () => {
    try {
      const next = await api.notifications(token)
      const fresh = next.items.filter(item => item.read_at === null && !seenIds.current.has(item.id))
      if (loadedOnce.current && fresh.length > 0) {
        setLiveAlert(fresh[0])
        if (alertTimer.current) window.clearTimeout(alertTimer.current)
        alertTimer.current = window.setTimeout(() => setLiveAlert(null), 6000)
      }
      next.items.forEach(item => seenIds.current.add(item.id))
      loadedOnce.current = true
      setFeed(next)
      const unreadGroups: Record<number, number> = {}
      next.items.filter(item => item.read_at === null && (item.notification_type === 'message' || item.notification_type === 'mention')).forEach(item => { unreadGroups[item.group_id] = (unreadGroups[item.group_id] ?? 0) + 1 })
      onUnreadGroups(unreadGroups)
      setProblem('')
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Notifications could not be loaded')
    }
  }, [token, onUnreadGroups])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 5000)
    return () => {
      window.clearInterval(timer)
      if (alertTimer.current) window.clearTimeout(alertTimer.current)
    }
  }, [refresh])

  async function selectNotification(item: NotificationItem) {
    try {
      if (item.read_at === null) {
        await api.markNotificationRead(token, item.id)
        const readAt = new Date().toISOString()
        setFeed(current => ({
          unread_count: Math.max(0, current.unread_count - 1),
          items: current.items.map(notification => notification.id === item.id ? { ...notification, read_at: readAt } : notification),
        }))
      }
      setOpen(false)
      setLiveAlert(null)
      onSelect(item)
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Notification could not be opened')
    }
  }

  async function markAllRead() {
    try {
      await api.markAllNotificationsRead(token)
      const readAt = new Date().toISOString()
      setFeed(current => ({ unread_count: 0, items: current.items.map(item => ({ ...item, read_at: item.read_at ?? readAt })) }))
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Notifications could not be marked as read')
    }
  }

  async function respondToRequest(item: NotificationItem, action: 'accept' | 'decline') {
    setRespondingId(item.id)
    setProblem('')
    try {
      const result = await api.respondToJoinRequest(token, item.id, action)
      const resolution = result.status as 'accepted' | 'declined'
      const readAt = new Date().toISOString()
      setFeed(current => {
        let newlyRead = 0
        const items = current.items.map(notification => {
          if (notification.notification_type !== 'join_request' || notification.group_id !== item.group_id || notification.actor_id !== item.actor_id || notification.resolution !== null) return notification
          if (notification.read_at === null) newlyRead += 1
          return { ...notification, resolution, read_at: notification.read_at ?? readAt }
        })
        return { items, unread_count: Math.max(0, current.unread_count - newlyRead) }
      })
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Could not respond to join request')
    } finally {
      setRespondingId(null)
    }
  }

  return <div className="notification-center">
    <button className={`notification-bell ${open ? 'notification-bell-open' : ''}`} aria-label={`Notifications${feed.unread_count ? `, ${feed.unread_count} unread` : ''}`} aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true">🔔</span>{feed.unread_count > 0 && <b className="notification-count">{feed.unread_count > 99 ? '99+' : feed.unread_count}</b>}
    </button>
    {open && createPortal(<>
      <button className="notification-dismiss-layer" aria-label="Close notifications" onClick={() => setOpen(false)} />
      <section className="notification-panel" aria-label="Notifications">
        <header className="notification-panel-header"><div><strong>Notifications</strong><small>{feed.unread_count ? `${feed.unread_count} unread` : 'You’re all caught up'}</small></div>{feed.unread_count > 0 && <button onClick={() => void markAllRead()}>Mark all read</button>}</header>
        {problem && <p className="notification-problem" role="alert">{problem}</p>}
        <div className="notification-list">{feed.items.length ? feed.items.map(item => <article key={item.id} className={`notification-item ${item.read_at === null ? 'notification-unread' : ''}`}>
          <button className="notification-main" onClick={() => void selectNotification(item)}>
            <span className={`notification-symbol ${item.notification_type === 'mention' ? 'mention-symbol' : item.notification_type === 'join_request' ? 'request-symbol' : 'message-symbol'}`}>
              {item.notification_type === 'mention' ? '@' : item.notification_type === 'join_request' ? '♙' : '↗'}
            </span>
            <span className="notification-copy">
              <strong>{item.notification_type === 'mention' ? 'Mentioned you' : item.notification_type === 'join_request' ? 'Join request' : 'New message'}</strong>
              <span>
                {item.notification_type === 'mention'
                  ? `${item.actor_name} (@${item.actor_username}) mentioned you in`
                  : item.notification_type === 'join_request'
                    ? `${item.actor_name} (@${item.actor_username}) asked to join`
                    : `${item.actor_name} (@${item.actor_username}) sent a message in`} <b>{item.group_name}</b>
              </span>
              <small>{new Date(item.created_at).toLocaleString()}</small>
            </span>
            {item.read_at === null && <i className="unread-dot" />}
          </button>
          {item.notification_type === 'join_request' && <div className="join-request-actions">{item.resolution === null ? <><button className="request-accept-button" disabled={respondingId === item.id} onClick={() => void respondToRequest(item, 'accept')}>{respondingId === item.id ? 'Saving…' : 'Accept'}</button><button className="request-decline-button" disabled={respondingId === item.id} onClick={() => void respondToRequest(item, 'decline')}>Decline</button></> : <span className={`request-resolution ${item.resolution}`}>{item.resolution === 'accepted' ? 'Accepted' : 'Declined'}</span>}</div>}
        </article>) : <div className="notifications-empty"><span>🔔</span><strong>No notifications yet</strong><p>Join requests, mentions, and new messages will show up here.</p></div>}</div>
      </section>
    </>, document.body)}
    {liveAlert && (
      <button className="notification-toast" onClick={() => void selectNotification(liveAlert)}>
        <span className="toast-notification-icon">{liveAlert.notification_type === 'mention' ? '@' : liveAlert.notification_type === 'join_request' ? '♙' : '↗'}</span>
        <span>
          <strong>{liveAlert.notification_type === 'mention' ? 'Mentioned you' : liveAlert.notification_type === 'join_request' ? 'New join request' : 'New message'}</strong>
          <small>{liveAlert.actor_name} (@{liveAlert.actor_username}) · {liveAlert.group_name}</small>
        </span>
        <span className="toast-close" onClick={event => { event.stopPropagation(); setLiveAlert(null) }}>×</span>
      </button>
    )}
  </div>
}

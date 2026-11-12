import { useCallback, useEffect, useState } from 'react'
import { ApiError, api, getMediaUrl } from './api/client'
import type { AuthResponse, AuthUser, NotificationItem } from './api/client'
import { AuthForm } from './auth/AuthForm'
import { ChatHome } from './chat/ChatHome'
import { NewsFeed } from './feed/NewsFeed'
import { NotificationCenter } from './notifications/NotificationCenter'
import { SettingsMenu } from './settings/SettingsMenu'
import { UserAvatar } from './components/UserAvatar'

const TOKEN_KEY = 'gather_access_token'
const THEME_KEY = 'gather_theme'
type Theme = 'light' | 'dark'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(Boolean(token))
  const [apiReady, setApiReady] = useState<boolean | null>(null)
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [notificationTarget, setNotificationTarget] = useState<NotificationItem | null>(null)
  const [unreadGroups, setUnreadGroups] = useState<Record<number, number>>({})
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light')
  const [currentView, setCurrentView] = useState<'chat' | 'feed'>('chat')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    let live = true
    api.health().then(() => live && setApiReady(true)).catch(() => live && setApiReady(false))
    return () => { live = false }
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setSessionError('')
      setCheckingSession(false)
      return
    }
    let live = true
    setCheckingSession(true)
    setSessionError('')
    api.me(token).then(value => {
      if (live) setUser(value)
    }).catch((error: unknown) => {
      if (!live) return
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      } else {
        setSessionError(error instanceof Error ? error.message : 'Could not restore your session')
      }
    }).finally(() => live && setCheckingSession(false))
    return () => { live = false }
  }, [token, sessionAttempt])

  function signedIn(result: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, result.access_token)
    setUser(result.user)
    setSessionError('')
    setToken(result.access_token)
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setNotificationTarget(null)
  }

  const handleNotificationSelect = useCallback((item: NotificationItem) => setNotificationTarget(item), [])
  const handleNotificationHandled = useCallback(() => setNotificationTarget(null), [])
  const handleUnreadGroups = useCallback((counts: Record<number, number>) => setUnreadGroups(counts), [])

  return (
    <div className="app-frame">
      <header className="site-header">
        <div className="header-left">
          <a className="wordmark" href="/" aria-label="Gather home"><span className="brand-mark">g</span>gather</a>
          {token && user && (
            <nav className="header-tabs-nav">
              <button
                type="button"
                className={`header-tab-pill ${currentView === 'chat' ? 'active' : ''}`}
                onClick={() => setCurrentView('chat')}
              >
                <span>💬</span> Chat
              </button>
              <button
                type="button"
                className={`header-tab-pill ${currentView === 'feed' ? 'active' : ''}`}
                onClick={() => setCurrentView('feed')}
              >
                <span>📰</span> News Feed
              </button>
            </nav>
          )}
        </div>
        <div className="header-right">
          <span className={`connection ${apiReady === false ? 'offline' : ''}`}><span className="connection-dot" />{apiReady === null ? 'Connecting' : apiReady ? 'All systems ready' : 'Server unavailable'}</span>
          {token && user && <NotificationCenter token={token} onSelect={handleNotificationSelect} onUnreadGroups={handleUnreadGroups} />}
          {user && <SettingsMenu theme={theme} onThemeChange={setTheme} user={user} token={token} onUserUpdated={setUser} />}
          {user && <div className="account-chip"><span className="avatar avatar-small"><UserAvatar avatarUrl={user.avatar_url} fallback={user.nickname || user.first_name || user.username} /></span><span>{(user.nickname ? `${user.nickname} (${user.first_name})` : [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)} <small>@{user.username}</small></span><button className="header-logout" onClick={signOut}>Log out</button></div>}
        </div>
      </header>
      {checkingSession ? (
        <div className="loading-screen"><span className="spinner" />Restoring your session…</div>
      ) : token && sessionError ? (
        <div className="loading-screen"><div className="session-recovery"><strong>Can’t reach your account right now</strong><p>{sessionError}</p><button className="button button-primary" onClick={() => setSessionAttempt(value => value + 1)}>Try again</button><button className="recovery-signout" onClick={signOut}>Sign out</button></div></div>
      ) : token && user ? (
        currentView === 'feed' ? (
          <NewsFeed token={token} user={user} />
        ) : (
          <ChatHome token={token} user={user} onUserUpdated={setUser} notificationTarget={notificationTarget} onNotificationHandled={handleNotificationHandled} unreadGroups={unreadGroups} onUnreadGroups={handleUnreadGroups} />
        )
      ) : (
        <AuthForm onSignedIn={signedIn} />
      )}
      <footer className="site-footer"><span>Gather · good conversations, together.</span><span>Made for your group</span></footer>
    </div>
  )
}

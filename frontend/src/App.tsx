import { useCallback, useEffect, useState } from 'react'
import { ApiError, api } from './api/client'
import type { AuthResponse, AuthUser, NotificationItem } from './api/client'
import { AuthForm } from './auth/AuthForm'
import { ChatHome } from './chat/ChatHome'
import { NewsFeed } from './feed/NewsFeed'
import { ProfileView } from './profile/ProfileView'
import { ShopView, type CartItem, type UserShop } from './shop/ShopView'
import { WatchView } from './videos/WatchView'
import { NotificationCenter } from './notifications/NotificationCenter'
import { SettingsMenu } from './settings/SettingsMenu'
import { UserAvatar } from './components/UserAvatar'

const TOKEN_KEY = 'gather_access_token'
const THEME_KEY = 'gather_theme'
const CART_KEY = 'gather_shop_cart'
type Theme = 'light' | 'dark'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(Boolean(token))
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [notificationTarget, setNotificationTarget] = useState<NotificationItem | null>(null)
  const [unreadGroups, setUnreadGroups] = useState<Record<number, number>>({})
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light')
  const [currentView, setCurrentView] = useState<'chat' | 'feed' | 'watch' | 'shop' | 'profile'>('chat')
  const [profileUsername, setProfileUsername] = useState<string>('')
  const [openPageModalTrigger, setOpenPageModalTrigger] = useState(false)

  // Shop Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  function handleCartChange(newCart: CartItem[]) {
    setCart(newCart)
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(newCart))
    } catch {}
  }

  // User Shop state & trigger from Settings
  const [userShop, setUserShop] = useState<UserShop | null>(() => {
    try {
      const saved = localStorage.getItem('gather_active_user_shop')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [openShopModalTrigger, setOpenShopModalTrigger] = useState(false)

  function handleOpenShopFromSettings() {
    setCurrentView('shop')
    setOpenShopModalTrigger(true)
  }

  function handleOpenPageFromSettings() {
    setCurrentView('watch')
    setOpenPageModalTrigger(true)
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

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
      <header className="site-header fb-site-header">
        {/* Left: Brand + Facebook Search Bar */}
        <div className="header-left">
          <a className="wordmark" href="/" aria-label="Gather home">
            <span className="brand-mark">g</span>gather
          </a>
          {token && user && (
            <div className="fb-header-search-wrap">
              <span className="fb-search-lens">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </span>
              <input
                type="text"
                className="fb-header-search-input"
                placeholder="Search Gather..."
                onClick={() => {
                  if (currentView !== 'feed' && currentView !== 'shop') {
                    setCurrentView('feed')
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Center: Facebook-style navigation tabs (newsfeed -> chat -> shop) */}
        {token && user && (
          <nav className="fb-header-center-tabs">
            {/* 1. News Feed */}
            <button
              type="button"
              className={`fb-tab-item ${currentView === 'feed' ? 'active' : ''}`}
              onClick={() => setCurrentView('feed')}
              title="News Feed"
            >
              <span className="fb-tab-icon">
                <svg viewBox="0 0 28 28" width="22" height="22" fill="currentColor">
                  <path d="M14.004 3.515a1.5 1.5 0 0 1 1.01.397l9.5 8.5a1.5 1.5 0 0 1-.998 2.588h-.516v8.5a1.5 1.5 0 0 1-1.5 1.5h-4.5a1.5 1.5 0 0 1-1.5-1.5v-5.5h-3v5.5a1.5 1.5 0 0 1-1.5 1.5h-4.5a1.5 1.5 0 0 1-1.5-1.5v-8.5h-.516a1.5 1.5 0 0 1-.998-2.588l9.5-8.5a1.5 1.5 0 0 1 1.01-.397z"/>
                </svg>
              </span>
              <span className="fb-tab-label">News Feed</span>
            </button>

            {/* 2. Watch / Videos */}
            <button
              type="button"
              className={`fb-tab-item ${currentView === 'watch' ? 'active' : ''}`}
              onClick={() => setCurrentView('watch')}
              title="Watch Videos & Pages"
            >
              <span className="fb-tab-icon">
                <svg viewBox="0 0 28 28" width="22" height="22" fill="currentColor">
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h15A2.5 2.5 0 0 1 24 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 4 17.5v-11zM12 9.5v5l4.5-2.5L12 9.5zM8 22.5a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1z"/>
                </svg>
              </span>
              <span className="fb-tab-label">Watch</span>
              <span className="fb-tab-new-tag" style={{ background: '#e02424' }}>VIDEOS</span>
            </button>

            {/* 3. Chat */}
            <button
              type="button"
              className={`fb-tab-item ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
              title="Chat / Messenger"
            >
              <span className="fb-tab-icon">
                <svg viewBox="0 0 28 28" width="22" height="22" fill="currentColor">
                  <path d="M14 2.04c-6.72 0-12.18 5.14-12.18 11.5 0 3.62 1.77 6.85 4.56 8.94V26l3.41-1.88c1.33.37 2.74.58 4.21.58 6.72 0 12.18-5.14 12.18-11.5S20.72 2.04 14 2.04zm1.22 15.54l-3.11-3.32-6.07 3.32 6.67-7.08 3.19 3.32 5.99-3.32-6.67 7.08z"/>
                </svg>
              </span>
              <span className="fb-tab-label">Chat</span>
            </button>

            {/* 4. Shop */}
            <button
              type="button"
              className={`fb-tab-item ${currentView === 'shop' ? 'active' : ''}`}
              onClick={() => setCurrentView('shop')}
              title="Gather Shop & Marketplace"
            >
              <span className="fb-tab-icon">
                <svg viewBox="0 0 28 28" width="22" height="22" fill="currentColor">
                  <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h17A1.5 1.5 0 0 1 24 8.5v2.88c0 1.45-.94 2.72-2.32 3.12-.48.14-.99.14-1.47 0A3.26 3.26 0 0 1 17.89 12a3.26 3.26 0 0 1-2.32 2.5 3.29 3.29 0 0 1-3.14 0A3.26 3.26 0 0 1 10.11 12a3.26 3.26 0 0 1-2.32 2.5c-.48.14-.99.14-1.47 0A3.24 3.24 0 0 1 4 11.38V8.5zM6 16.5a1.5 1.5 0 0 1 1.5-1.5h13a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 6 22.5v-6zm3 1.5v3h10v-3H9z"/>
                </svg>
              </span>
              <span className="fb-tab-label">Shop</span>
              <span className="fb-tab-new-tag">HOT</span>
            </button>
          </nav>
        )}

        {/* Right: Notification -> Setting -> Profile Icon */}
        <div className="header-right fb-header-right">
          {token && user && (
            <div className="fb-action-buttons-group">
              {/* 4. Notification */}
              <NotificationCenter
                token={token}
                onSelect={handleNotificationSelect}
                onUnreadGroups={handleUnreadGroups}
              />

              {/* 5. Setting */}
              <SettingsMenu
                theme={theme}
                onThemeChange={setTheme}
                onSignOut={signOut}
                onOpenShop={handleOpenShopFromSettings}
                onOpenPage={handleOpenPageFromSettings}
                hasUserShop={Boolean(userShop)}
              />
            </div>
          )}

          {/* 6. Profile Icon */}
          {user && (
            <div
              className="account-chip fb-account-chip"
              style={{ cursor: 'pointer' }}
              title="View your profile"
              onClick={() => {
                setProfileUsername(user.username)
                setCurrentView('profile')
              }}
            >
              <span className="avatar avatar-small">
                <UserAvatar
                  avatarUrl={user.avatar_url}
                  fallback={user.nickname || user.first_name || user.username}
                />
              </span>
              <span className="fb-account-name">
                {user.first_name || user.nickname || user.username}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main View Area */}
      {checkingSession ? (
        <div className="loading-screen"><span className="spinner" />Restoring your session…</div>
      ) : token && sessionError ? (
        <div className="loading-screen">
          <div className="session-recovery">
            <strong>Can’t reach your account right now</strong>
            <p>{sessionError}</p>
            <button className="button button-primary" onClick={() => setSessionAttempt(value => value + 1)}>
              Try again
            </button>
            <button className="recovery-signout" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      ) : token && user ? (
        currentView === 'shop' ? (
          <ShopView
            user={user}
            cart={cart}
            onCartChange={handleCartChange}
            onOpenChat={() => setCurrentView('chat')}
            onOpenFeed={() => setCurrentView('feed')}
            userShop={userShop}
            onUserShopChange={setUserShop}
            openShopTrigger={openShopModalTrigger}
            onOpenShopTriggerHandled={() => setOpenShopModalTrigger(false)}
          />
        ) : currentView === 'watch' ? (
          <WatchView
            token={token}
            user={user}
            openPageTrigger={openPageModalTrigger}
            onOpenPageTriggerHandled={() => setOpenPageModalTrigger(false)}
            onOpenChat={() => setCurrentView('chat')}
            onOpenFeed={() => setCurrentView('feed')}
            onOpenProfile={(username) => {
              setProfileUsername(username)
              setCurrentView('profile')
            }}
          />
        ) : currentView === 'feed' ? (
          <NewsFeed
            token={token}
            user={user}
            onOpenGroupChat={() => setCurrentView('chat')}
            onOpenProfile={(username) => {
              setProfileUsername(username)
              setCurrentView('profile')
            }}
          />
        ) : currentView === 'profile' ? (
          <ProfileView
            token={token}
            currentUser={user}
            targetUsername={profileUsername || user.username}
            onUserUpdated={setUser}
            onBackToFeed={() => setCurrentView('feed')}
            onOpenChat={() => setCurrentView('chat')}
          />
        ) : (
          <ChatHome
            token={token}
            user={user}
            notificationTarget={notificationTarget}
            onNotificationHandled={handleNotificationHandled}
            unreadGroups={unreadGroups}
            onUnreadGroups={handleUnreadGroups}
          />
        )
      ) : (
        <AuthForm onSignedIn={signedIn} />
      )}
      {!user && (
        <footer className="site-footer">
          <span>Gather · good conversations, together.</span>
          <span>Made for your group</span>
        </footer>
      )}
    </div>
  )
}

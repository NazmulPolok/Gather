import { useEffect, useState } from 'react'
import { api, type ActivityItem, type AuthUser, type PostItem, type UserSession, type UserSettings } from '../api/client'
import { UserAvatar } from '../components/UserAvatar'

interface SettingsViewProps {
  token: string
  currentUser: AuthUser
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  onClose?: () => void
  onOpenShop?: () => void
  onOpenWatch?: () => void
  onSignOut?: () => void
}

type TabType =
  | 'privacy'
  | 'security'
  | 'activity'
  | 'trash'
  | 'archive'
  | 'saved'
  | 'notifications'
  | 'appearance'
  | 'accounts'

export function SettingsView({
  token,
  currentUser,
  theme,
  onThemeChange,
  onClose,
  onOpenShop,
  onOpenWatch,
  onSignOut,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('privacy')
  const [loading, setLoading] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState('')

  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
    who_can_see_posts: 'public',
    who_can_comment: 'public',
    who_can_tag: 'everyone',
    who_can_send_friend_requests: 'everyone',
    who_can_see_friends_list: 'public',
    post_notifications_enabled: true,
    sound_enabled: true,
    language: 'en',
    font_size: 'standard',
  })

  // Security Sessions
  const [sessions, setSessions] = useState<UserSession[]>([])
  // Activity Log
  const [activities, setActivities] = useState<ActivityItem[]>([])
  // Trash Items
  const [trashItems, setTrashItems] = useState<PostItem[]>([])
  // Archive Items
  const [archiveItems, setArchiveItems] = useState<PostItem[]>([])
  // Saved Posts
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>('All')

  // Load Settings on Mount
  useEffect(() => {
    let live = true
    api.getUserSettings(token)
      .then(res => {
        if (live && res) setSettings(res)
      })
      .catch(() => {})
    return () => { live = false }
  }, [token])

  // Load tab-specific data
  useEffect(() => {
    let live = true
    if (activeTab === 'security') {
      setLoading(true)
      api.getUserSessions(token)
        .then(res => { if (live) setSessions(res) })
        .catch(() => {})
        .finally(() => { if (live) setLoading(false) })
    } else if (activeTab === 'activity') {
      setLoading(true)
      api.getUserActivityLog(token)
        .then(res => { if (live) setActivities(res.activities) })
        .catch(() => {})
        .finally(() => { if (live) setLoading(false) })
    } else if (activeTab === 'trash') {
      setLoading(true)
      api.getUserTrash(token)
        .then(res => { if (live) setTrashItems(res) })
        .catch(() => {})
        .finally(() => { if (live) setLoading(false) })
    } else if (activeTab === 'archive') {
      setLoading(true)
      api.getUserArchive(token)
        .then(res => { if (live) setArchiveItems(res) })
        .catch(() => {})
        .finally(() => { if (live) setLoading(false) })
    } else if (activeTab === 'saved') {
      setLoading(true)
      api.getSavedPosts(token)
        .then(res => { if (live) setSavedPosts(res) })
        .catch(() => {})
        .finally(() => { if (live) setLoading(false) })
    }
    return () => { live = false }
  }, [token, activeTab])

  // Save Settings Helper
  async function updateSettingField<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    try {
      await api.updateUserSettings(token, { [key]: value })
      setSavedSuccess('Settings updated successfully')
      setTimeout(() => setSavedSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to update settings', err)
    }
  }

  // Restore Post from Trash
  async function handleRestoreFromTrash(postId: number) {
    try {
      await api.restorePost(token, postId)
      setTrashItems(prev => prev.filter(p => p.id !== postId))
      setSavedSuccess('Post restored to your feed')
      setTimeout(() => setSavedSuccess(''), 3000)
    } catch {
      alert('Could not restore post')
    }
  }

  // Permanently Delete from Trash
  async function handlePermanentDelete(postId: number) {
    if (!window.confirm('Delete this post permanently? This cannot be undone.')) return
    try {
      await api.deletePost(token, postId)
      setTrashItems(prev => prev.filter(p => p.id !== postId))
      setSavedSuccess('Post permanently deleted')
      setTimeout(() => setSavedSuccess(''), 3000)
    } catch {
      alert('Could not delete post')
    }
  }

  // Unarchive Post
  async function handleUnarchive(postId: number) {
    try {
      await api.unarchivePost(token, postId)
      setArchiveItems(prev => prev.filter(p => p.id !== postId))
      setSavedSuccess('Post restored to profile')
      setTimeout(() => setSavedSuccess(''), 3000)
    } catch {
      alert('Could not unarchive post')
    }
  }

  // Terminate remote session
  async function handleTerminateSession(sessionId: string) {
    try {
      await api.terminateUserSession(token, sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setSavedSuccess('Session terminated')
      setTimeout(() => setSavedSuccess(''), 3000)
    } catch {
      alert('Could not terminate session')
    }
  }

  // Log out other sessions
  async function handleLogoutOthers() {
    try {
      await api.logoutOtherSessions(token)
      setSessions(prev => prev.filter(s => s.is_current))
      setSavedSuccess('All other sessions logged out')
      setTimeout(() => setSavedSuccess(''), 3000)
    } catch {
      alert('Could not log out other sessions')
    }
  }

  // Calculate days remaining for trash item (30 days total)
  function getDaysRemaining(deletedAt?: string | null): number {
    if (!deletedAt) return 30
    const deletedDate = new Date(deletedAt)
    const diffMs = Date.now() - deletedDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(0, 30 - diffDays)
  }

  return (
    <div className="fb-settings-hub-container">
      {/* Settings Top Header Bar */}
      <header className="fb-settings-topbar">
        <div className="fb-settings-topbar-left">
          {onClose && (
            <button className="fb-settings-back-btn" onClick={onClose} title="Back to Feed">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <div className="fb-settings-brand-title">
            <h2>Settings & Privacy</h2>
            <span>Manage your account preferences, privacy, and active devices</span>
          </div>
        </div>

        {savedSuccess && (
          <div className="fb-settings-toast-banner">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{savedSuccess}</span>
          </div>
        )}
      </header>

      <div className="fb-settings-layout">
        {/* Left Sidebar Navigation */}
        <aside className="fb-settings-sidebar">
          {/* User profile brief card */}
          <div className="fb-settings-user-card">
            <div className="fb-settings-user-avatar">
              <UserAvatar avatarUrl={currentUser.avatar_url} fallback={currentUser.nickname || currentUser.first_name || currentUser.username} />
            </div>
            <div className="fb-settings-user-meta">
              <strong>{currentUser.first_name} {currentUser.last_name}</strong>
              <small>@{currentUser.username}</small>
            </div>
          </div>

          <nav className="fb-settings-nav">
            <div className="fb-settings-nav-section-label">Account & Visibility</div>
            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span>Privacy & Audience</span>
            </button>

            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </span>
              <span>Security & Sessions</span>
            </button>

            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>Activity Log</span>
            </button>

            <div className="fb-settings-nav-section-label">Your Content Lifecycle</div>
            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'trash' ? 'active' : ''}`}
              onClick={() => setActiveTab('trash')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </span>
              <span>Recently Deleted (Trash)</span>
              {trashItems.length > 0 && <span className="fb-nav-badge">{trashItems.length}</span>}
            </button>

            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </span>
              <span>Archive</span>
            </button>

            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span>Saved Collections</span>
            </button>

            <div className="fb-settings-nav-section-label">Preferences</div>
            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </span>
              <span>Theme & Language</span>
            </button>

            <button
              type="button"
              className={`fb-settings-nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <span className="fb-settings-nav-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>Account Switcher</span>
            </button>
          </nav>

          {/* Quick jump actions at bottom */}
          <div className="fb-settings-sidebar-bottom">
            {onOpenShop && (
              <button type="button" className="fb-settings-quick-link" onClick={onOpenShop}>
                🛒 Open Shop Manager
              </button>
            )}
            {onOpenWatch && (
              <button type="button" className="fb-settings-quick-link" onClick={onOpenWatch}>
                📺 Watch Creator Studio
              </button>
            )}
            {onSignOut && (
              <button type="button" className="fb-settings-logout-btn" onClick={onSignOut}>
                Log out
              </button>
            )}
          </div>
        </aside>

        {/* Right Content Pane */}
        <main className="fb-settings-content">
          {/* TAB 1: Privacy & Visibility */}
          {activeTab === 'privacy' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Privacy Settings & Visibility</h3>
                <p>Control who can see your content, interact with you, and find your profile on Gather.</p>
              </div>

              <div className="fb-settings-card-group">
                {/* 1. Who can see your post? */}
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Who can see your posts?</h4>
                    <p>Default audience for posts you publish to your feed and profile.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.who_can_see_posts}
                      onChange={e => updateSettingField('who_can_see_posts', e.target.value as any)}
                    >
                      <option value="public">🌐 Public (Anyone on Gather)</option>
                      <option value="friends">👥 Friends (Your connections only)</option>
                      <option value="only_me">🔒 Only Me (Private to you)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Who can comment? */}
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Who can comment on your posts?</h4>
                    <p>Choose who is allowed to comment on your public updates.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.who_can_comment}
                      onChange={e => updateSettingField('who_can_comment', e.target.value as any)}
                    >
                      <option value="public">🌐 Public (Everyone)</option>
                      <option value="friends">👥 Friends</option>
                      <option value="mentioned">🏷️ Profiles you mention</option>
                    </select>
                  </div>
                </div>

                {/* 3. Who can tag you? */}
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Who can tag you in posts?</h4>
                    <p>Review tags on photos and posts before they appear on your profile timeline.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.who_can_tag}
                      onChange={e => updateSettingField('who_can_tag', e.target.value as any)}
                    >
                      <option value="everyone">🌐 Everyone</option>
                      <option value="friends">👥 Friends only</option>
                      <option value="review">🛡️ Tag Review (Approve before showing)</option>
                    </select>
                  </div>
                </div>

                {/* 4. Who can send you friend requests? */}
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Who can send you friend requests?</h4>
                    <p>Select who is able to add you as a friend or connect.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.who_can_send_friend_requests}
                      onChange={e => updateSettingField('who_can_send_friend_requests', e.target.value as any)}
                    >
                      <option value="everyone">🌐 Everyone</option>
                      <option value="friends_of_friends">👥 Friends of Friends</option>
                    </select>
                  </div>
                </div>

                {/* 5. Who can see your friends list? */}
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Who can see your friends list?</h4>
                    <p>Keep your social network list visible or completely private.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.who_can_see_friends_list}
                      onChange={e => updateSettingField('who_can_see_friends_list', e.target.value as any)}
                    >
                      <option value="public">🌐 Public</option>
                      <option value="friends">👥 Friends</option>
                      <option value="only_me">🔒 Only Me</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Active Sessions */}
          {activeTab === 'security' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Security & Active Sessions</h3>
                <p>Where you're currently logged in, trusted devices, and remote session termination.</p>
              </div>

              <div className="fb-security-actions-card">
                <div className="fb-security-status">
                  <div className="fb-security-badge-icon">🛡️</div>
                  <div>
                    <strong>Two-Factor Authentication (2FA)</strong>
                    <p>Protect your account with extra security steps on unrecognized logins.</p>
                  </div>
                </div>
                <button type="button" className="button button-outline" onClick={() => alert('Two-factor authentication is active on this account.')}>
                  Enabled
                </button>
              </div>

              <div className="fb-settings-card-group">
                <div className="fb-sessions-header-row">
                  <div>
                    <h4>Login Activity & Active Sessions</h4>
                    <small>Review where your Gather account is active</small>
                  </div>
                  <button type="button" className="fb-terminate-all-btn" onClick={handleLogoutOthers}>
                    Log Out of All Other Sessions
                  </button>
                </div>

                {loading ? (
                  <div className="fb-settings-empty">Loading active sessions...</div>
                ) : (
                  <div className="fb-sessions-list">
                    {sessions.map(sess => (
                      <div key={sess.id} className={`fb-session-item ${sess.is_current ? 'current' : ''}`}>
                        <div className="fb-session-icon">
                          {sess.device.toLowerCase().includes('phone') || sess.device.toLowerCase().includes('iphone') ? '📱' : '💻'}
                        </div>
                        <div className="fb-session-details">
                          <div className="fb-session-title">
                            <strong>{sess.device}</strong>
                            {sess.is_current ? (
                              <span className="fb-active-now-tag">Active now • This device</span>
                            ) : (
                              <span className="fb-session-time">Last active {new Date(sess.last_active_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                          <div className="fb-session-subtitle">
                            {sess.browser} • {sess.location || 'Dhaka, Bangladesh'} ({sess.ip_address || '127.0.0.1'})
                          </div>
                        </div>
                        {!sess.is_current && (
                          <button
                            type="button"
                            className="fb-session-remove-btn"
                            title="Sign out of this device"
                            onClick={() => handleTerminateSession(sess.id)}
                          >
                            Sign Out
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Activity Log */}
          {activeTab === 'activity' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Activity Log</h3>
                <p>A chronological history of all your posts, reactions, comments, and interactions on Gather.</p>
              </div>

              {loading ? (
                <div className="fb-settings-empty">Loading activity history...</div>
              ) : activities.length === 0 ? (
                <div className="fb-settings-empty">No recent activity found.</div>
              ) : (
                <div className="fb-activity-timeline">
                  {activities.map(item => (
                    <div key={item.id} className="fb-activity-entry">
                      <div className="fb-activity-icon">
                        {item.type === 'post' ? '📝' : item.type === 'comment' ? '💬' : '👍'}
                      </div>
                      <div className="fb-activity-content">
                        <strong>{item.action}</strong>
                        <small>{new Date(item.timestamp).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Recently Deleted (Trash) */}
          {activeTab === 'trash' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Recently Deleted (Recycle Bin)</h3>
                <p>Items in your trash can be restored within 30 days. After 30 days, they will be deleted permanently.</p>
              </div>

              {loading ? (
                <div className="fb-settings-empty">Loading trash items...</div>
              ) : trashItems.length === 0 ? (
                <div className="fb-settings-empty">
                  <div className="fb-empty-trash-icon">🗑️</div>
                  <strong>Your Trash is empty</strong>
                  <p>When you delete posts, they'll show up here with a 30-day restore guarantee.</p>
                </div>
              ) : (
                <div className="fb-trash-list">
                  {trashItems.map(post => {
                    const daysLeft = getDaysRemaining(post.deleted_at)
                    return (
                      <div key={post.id} className="fb-trash-card">
                        <div className="fb-trash-meta">
                          <div className="fb-trash-badge">
                            ⏳ {daysLeft} days left before permanent deletion
                          </div>
                          <h4>{post.title}</h4>
                          {post.content && <p>{post.content.slice(0, 150)}...</p>}
                          <small>Deleted {post.deleted_at ? new Date(post.deleted_at).toLocaleDateString() : 'recently'}</small>
                        </div>
                        <div className="fb-trash-actions">
                          <button
                            type="button"
                            className="button button-primary"
                            onClick={() => handleRestoreFromTrash(post.id)}
                          >
                            Restore to Profile
                          </button>
                          <button
                            type="button"
                            className="button button-outline"
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() => handlePermanentDelete(post.id)}
                          >
                            Delete Permanently
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Archive */}
          {activeTab === 'archive' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Archived Posts</h3>
                <p>Posts you've archived are hidden from your profile and feed, but remain saved and visible only to you.</p>
              </div>

              {loading ? (
                <div className="fb-settings-empty">Loading archived posts...</div>
              ) : archiveItems.length === 0 ? (
                <div className="fb-settings-empty">
                  <div className="fb-empty-trash-icon">📦</div>
                  <strong>No archived posts</strong>
                  <p>You can archive any post from the 3-dot options menu to preserve it privately.</p>
                </div>
              ) : (
                <div className="fb-trash-list">
                  {archiveItems.map(post => (
                    <div key={post.id} className="fb-trash-card">
                      <div className="fb-trash-meta">
                        <div className="fb-trash-badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                          🔒 Archived (Private)
                        </div>
                        <h4>{post.title}</h4>
                        {post.content && <p>{post.content.slice(0, 150)}...</p>}
                        <small>Archived post</small>
                      </div>
                      <div className="fb-trash-actions">
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => handleUnarchive(post.id)}
                        >
                          Restore to Feed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Saved Collections */}
          {activeTab === 'saved' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Saved Collections</h3>
                <p>Posts, videos, and articles you've saved to read or view later.</p>
              </div>

              {/* Collection Tabs */}
              <div className="fb-saved-chips">
                {['All', 'Favorites', 'Watch Later', 'Ideas', 'Articles'].map(col => (
                  <button
                    key={col}
                    type="button"
                    className={`fb-saved-chip ${selectedCollection === col ? 'active' : ''}`}
                    onClick={() => setSelectedCollection(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="fb-settings-empty">Loading saved posts...</div>
              ) : savedPosts.length === 0 ? (
                <div className="fb-settings-empty">
                  <div className="fb-empty-trash-icon">🔖</div>
                  <strong>No saved items yet</strong>
                  <p>Click "Save post" from any post's options menu to organize items into collections.</p>
                </div>
              ) : (
                <div className="fb-trash-list">
                  {savedPosts.map(post => (
                    <div key={post.id} className="fb-trash-card">
                      <div className="fb-trash-meta">
                        <div className="fb-trash-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          📁 Favorites
                        </div>
                        <h4>{post.title}</h4>
                        {post.content && <p>{post.content.slice(0, 150)}...</p>}
                        <small>By @{post.author.username} • {new Date(post.created_at).toLocaleDateString()}</small>
                      </div>
                      <div className="fb-trash-actions">
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={async () => {
                            await api.unsavePost(token, post.id)
                            setSavedPosts(prev => prev.filter(p => p.id !== post.id))
                          }}
                        >
                          Remove from Saved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Notifications & Sound */}
          {activeTab === 'notifications' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Notification Preferences</h3>
                <p>Customize what alerts and sounds you receive across Gather.</p>
              </div>

              <div className="fb-settings-card-group">
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>In-app Notification Sounds</h4>
                    <p>Play a gentle chime when new messages or reactions arrive.</p>
                  </div>
                  <div className="fb-setting-control">
                    <label className="fb-toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.sound_enabled}
                        onChange={e => updateSettingField('sound_enabled', e.target.checked)}
                      />
                      <span className="fb-toggle-slider" />
                    </label>
                  </div>
                </div>

                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Post Activity & Interaction Alerts</h4>
                    <p>Receive notifications when someone comments, reacts, or replies to your posts.</p>
                  </div>
                  <div className="fb-setting-control">
                    <label className="fb-toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.post_notifications_enabled}
                        onChange={e => updateSettingField('post_notifications_enabled', e.target.checked)}
                      />
                      <span className="fb-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Appearance & Language */}
          {activeTab === 'appearance' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Appearance & Language</h3>
                <p>Customize interface theme, display font sizing, and preferred language.</p>
              </div>

              <div className="fb-settings-card-group">
                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Theme Mode</h4>
                    <p>Select light or dark contrast for the Gather interface.</p>
                  </div>
                  <div className="fb-setting-control fb-theme-switcher-pills">
                    <button
                      type="button"
                      className={`fb-theme-pill ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => onThemeChange('light')}
                    >
                      ☀️ Light
                    </button>
                    <button
                      type="button"
                      className={`fb-theme-pill ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => onThemeChange('dark')}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>

                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Display Language</h4>
                    <p>Choose your preferred interface language.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.language}
                      onChange={e => updateSettingField('language', e.target.value)}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                  </div>
                </div>

                <div className="fb-setting-row">
                  <div className="fb-setting-info">
                    <h4>Font Scaling</h4>
                    <p>Adjust font size and layout density across the application.</p>
                  </div>
                  <div className="fb-setting-control">
                    <select
                      className="fb-setting-select"
                      value={settings.font_size}
                      onChange={e => updateSettingField('font_size', e.target.value as any)}
                    >
                      <option value="compact">Compact (Higher Density)</option>
                      <option value="standard">Standard (Default)</option>
                      <option value="comfortable">Comfortable (Larger Text)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: Account Switcher */}
          {activeTab === 'accounts' && (
            <div className="fb-settings-section">
              <div className="fb-settings-header">
                <h3>Account Switcher</h3>
                <p>Switch seamlessly between registered Gather profiles without having to re-enter credentials.</p>
              </div>

              <div className="fb-accounts-list">
                <div className="fb-account-switch-card current">
                  <div className="fb-account-switch-avatar">
                    <UserAvatar avatarUrl={currentUser.avatar_url} fallback={currentUser.first_name || currentUser.username} />
                  </div>
                  <div className="fb-account-switch-meta">
                    <strong>{currentUser.first_name} {currentUser.last_name}</strong>
                    <small>@{currentUser.username} • Currently Logged In</small>
                  </div>
                  <span className="fb-account-active-badge">Active</span>
                </div>

                <div className="fb-add-account-card" onClick={() => {
                  if (window.confirm('Do you want to log out and sign in with a different account?')) {
                    onSignOut?.()
                  }
                }}>
                  <div className="fb-add-account-icon">+</div>
                  <div className="fb-account-switch-meta">
                    <strong>Add Another Account</strong>
                    <small>Log in to a second profile</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

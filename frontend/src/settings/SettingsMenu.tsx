import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { api, getMediaUrl, type AuthUser } from '../api/client'

type Theme = 'light' | 'dark'

export function SettingsMenu({
  theme,
  onThemeChange,
  user,
  token,
  onUserUpdated,
}: {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  user: AuthUser | null
  token: string | null
  onUserUpdated?: (user: AuthUser) => void
}) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<'main' | 'theme' | 'profile'>('main')
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [savingNick, setSavingNick] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [profileNotice, setProfileNotice] = useState('')
  const [profileError, setProfileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '')
    }
  }, [user])

  function toggle() {
    if (!open) {
      setPage('main')
      setProfileNotice('')
      setProfileError('')
    }
    setOpen(value => !value)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    e.target.value = ''
    if (file.size > 10 * 1024 * 1024) {
      setProfileError('Image cannot exceed 10MB.')
      return
    }
    setSavingAvatar(true)
    setProfileError('')
    setProfileNotice('')
    try {
      const updated = await api.updateAvatar(token, file)
      onUserUpdated?.(updated)
      setProfileNotice('Profile picture updated successfully!')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not upload photo')
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handleRemoveAvatar() {
    if (!token) return
    setSavingAvatar(true)
    setProfileError('')
    setProfileNotice('')
    try {
      const updated = await api.removeAvatar(token)
      onUserUpdated?.(updated)
      setProfileNotice('Profile picture removed.')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not remove photo')
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handleSaveNickname(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setSavingNick(true)
    setProfileError('')
    setProfileNotice('')
    try {
      const updated = await api.updateProfile(token, { nickname: nickname.trim() || null })
      onUserUpdated?.(updated)
      setProfileNotice('Nickname updated successfully!')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not update nickname')
    } finally {
      setSavingNick(false)
    }
  }

  async function handleClearNickname() {
    if (!token) return
    setSavingNick(true)
    setProfileError('')
    setProfileNotice('')
    try {
      const updated = await api.updateProfile(token, { nickname: null })
      onUserUpdated?.(updated)
      setNickname('')
      setProfileNotice('Nickname cleared.')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not clear nickname')
    } finally {
      setSavingNick(false)
    }
  }

  return (
    <>
      <div className="settings-menu">
        <button
          className={`settings-trigger ${open ? 'settings-trigger-open' : ''}`}
          aria-label="Settings"
          aria-expanded={open}
          onClick={toggle}
        >
          <span aria-hidden="true">⚙</span>
          <span className="settings-trigger-label">Settings</span>
        </button>
      </div>
      {open &&
        createPortal(
          <>
            <button className="settings-overlay" aria-label="Close settings" onClick={() => setOpen(false)} />
            <section className="settings-panel" role="dialog" aria-label="Settings">
              {page === 'main' ? (
                <>
                  <header>
                    <div>
                      <strong>Settings</strong>
                      <small>Personalize your Gather experience</small>
                    </div>
                    <button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">
                      ×
                    </button>
                  </header>
                  <div className="settings-menu-list">
                    <button className="settings-option-row" onClick={() => { setPage('profile'); setProfileNotice(''); setProfileError('') }}>
                      <span className="settings-option-icon">👤</span>
                      <span>
                        <strong>Profile</strong>
                        <small>{user?.nickname ? `Nick: ${user.nickname}` : 'Photo, nickname & account info'}</small>
                      </span>
                      <span className="settings-option-arrow">›</span>
                    </button>
                    <button className="settings-option-row" onClick={() => setPage('theme')}>
                      <span className="settings-option-icon">◐</span>
                      <span>
                        <strong>Theme</strong>
                        <small>{theme === 'light' ? 'Light' : 'Dark'}</small>
                      </span>
                      <span className="settings-option-arrow">›</span>
                    </button>
                  </div>
                  <p className="settings-footer">Manage your account details and preferences.</p>
                </>
              ) : page === 'profile' ? (
                <>
                  <header className="settings-subheader">
                    <button className="settings-back" onClick={() => setPage('main')} aria-label="Back to settings">
                      ‹
                    </button>
                    <div>
                      <strong>Profile</strong>
                      <small>Profile picture, nickname & account</small>
                    </div>
                    <button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">
                      ×
                    </button>
                  </header>
                  <div className="settings-profile-container">
                    {profileNotice && <div className="settings-alert-success">{profileNotice}</div>}
                    {profileError && <div className="settings-alert-error">{profileError}</div>}

                    {/* 1. Signed up Email Info Card */}
                    <div className="settings-email-card">
                      <div className="settings-email-badge">
                        <span className="badge-icon">✉</span>
                        <span className="badge-label">Signed up with email:</span>
                      </div>
                      <strong className="settings-email-value">{user?.email}</strong>
                      <small className="settings-email-meta">
                        Registered Name: {[user?.first_name, user?.last_name].filter(Boolean).join(' ')} · @{user?.username}
                      </small>
                    </div>

                    {/* 2. Profile Picture */}
                    <div className="settings-field-group">
                      <span className="settings-section-title">PROFILE PICTURE</span>
                      <div className="settings-avatar-row">
                        <div className="settings-avatar-display">
                          {user?.avatar_url ? (
                            <img src={getMediaUrl(user.avatar_url)} alt="Avatar" className="avatar-img-round" />
                          ) : (
                            <span className="avatar-initial">
                              {(user?.nickname || user?.first_name || user?.username || 'U').slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="settings-avatar-buttons">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          <button
                            type="button"
                            className="button button-primary button-sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={savingAvatar}
                          >
                            📷 {savingAvatar ? 'Uploading…' : user?.avatar_url ? 'Change Photo' : 'Upload Photo'}
                          </button>
                          {user?.avatar_url && (
                            <button
                              type="button"
                              className="outline-button button-sm"
                              onClick={handleRemoveAvatar}
                              disabled={savingAvatar}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Nickname */}
                    <form className="settings-field-group" onSubmit={handleSaveNickname}>
                      <label htmlFor="settings-nickname-input" className="settings-section-title">
                        YOUR NICKNAME
                      </label>
                      <div className="settings-nickname-row">
                        <input
                          id="settings-nickname-input"
                          type="text"
                          className="settings-text-input"
                          placeholder="Set a nickname..."
                          value={nickname}
                          onChange={e => setNickname(e.target.value)}
                          maxLength={64}
                          disabled={savingNick}
                        />
                        <button
                          type="submit"
                          className="button button-primary button-sm"
                          disabled={savingNick || nickname.trim() === (user?.nickname || '')}
                        >
                          {savingNick ? 'Saving…' : 'Save'}
                        </button>
                        {user?.nickname && (
                          <button
                            type="button"
                            className="outline-button button-sm"
                            onClick={handleClearNickname}
                            disabled={savingNick}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <small className="settings-field-hint">
                        This nickname will be displayed across your groups and messages.
                      </small>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <header className="settings-subheader">
                    <button className="settings-back" onClick={() => setPage('main')} aria-label="Back to settings">
                      ‹
                    </button>
                    <div>
                      <strong>Theme</strong>
                      <small>Choose your appearance</small>
                    </div>
                    <button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">
                      ×
                    </button>
                  </header>
                  <div className="theme-choice-list">
                    <button
                      className={`theme-choice ${theme === 'light' ? 'theme-choice-selected' : ''}`}
                      onClick={() => onThemeChange('light')}
                    >
                      <span className="theme-preview theme-preview-light">☀</span>
                      <span>
                        <strong>Light</strong>
                        <small>Bright and clear</small>
                      </span>
                      {theme === 'light' && <b>✓</b>}
                    </button>
                    <button
                      className={`theme-choice ${theme === 'dark' ? 'theme-choice-selected' : ''}`}
                      onClick={() => onThemeChange('dark')}
                    >
                      <span className="theme-preview theme-preview-dark">☾</span>
                      <span>
                        <strong>Dark</strong>
                        <small>Easy on the eyes</small>
                      </span>
                      {theme === 'dark' && <b>✓</b>}
                    </button>
                  </div>
                </>
              )}
            </section>
          </>,
          document.body
        )}
    </>
  )
}

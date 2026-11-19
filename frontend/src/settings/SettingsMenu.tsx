import { useState } from 'react'
import { createPortal } from 'react-dom'

type Theme = 'light' | 'dark'

export function SettingsMenu({
  theme,
  onThemeChange,
  onSignOut,
}: {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onSignOut?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<'main' | 'theme'>('main')

  function toggle() {
    if (!open) {
      setPage('main')
    }
    setOpen(value => !value)
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
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
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
                    <button className="settings-option-row" onClick={() => setPage('theme')}>
                      <span className="settings-option-icon">◐</span>
                      <span>
                        <strong>Theme</strong>
                        <small>{theme === 'light' ? 'Light mode' : 'Dark mode'}</small>
                      </span>
                      <span className="settings-option-arrow">›</span>
                    </button>
                    {onSignOut && (
                      <button
                        className="settings-option-row settings-option-logout"
                        onClick={() => {
                          setOpen(false)
                          onSignOut()
                        }}
                      >
                        <span className="settings-option-icon">🚪</span>
                        <span>
                          <strong className="logout-text-danger">Log out</strong>
                          <small>Sign out of your account</small>
                        </span>
                        <span className="settings-option-arrow">›</span>
                      </button>
                    )}
                  </div>
                  <p className="settings-footer">Manage your appearance and preferences.</p>
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

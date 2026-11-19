import { useState } from 'react'
import { createPortal } from 'react-dom'

type Theme = 'light' | 'dark'

export function SettingsMenu({
  theme,
  onThemeChange,
  onSignOut,
  onOpenShop,
  hasUserShop,
}: {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onSignOut?: () => void
  onOpenShop?: () => void
  hasUserShop?: boolean
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
                    {/* Open Shop Button in Settings */}
                    <button
                      type="button"
                      className="settings-option-row settings-option-shop"
                      onClick={() => {
                        setOpen(false)
                        onOpenShop?.()
                      }}
                    >
                      <span className="settings-option-icon settings-option-shop-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </span>
                      <span>
                        <strong className="shop-title-text">Open Shop</strong>
                        <small>{hasUserShop ? 'Manage your storefront & products' : 'Create your store & start selling'}</small>
                      </span>
                      {hasUserShop ? (
                        <span className="settings-shop-status-pill">Active</span>
                      ) : (
                        <span className="settings-shop-new-pill">NEW</span>
                      )}
                      <span className="settings-option-arrow">›</span>
                    </button>

                    {/* Theme Option */}
                    <button className="settings-option-row" onClick={() => setPage('theme')}>
                      <span className="settings-option-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a10 10 0 0 1 0 20Z" fill="currentColor" />
                        </svg>
                      </span>
                      <span>
                        <strong>Theme</strong>
                        <small>{theme === 'light' ? 'Light mode' : 'Dark mode'}</small>
                      </span>
                      <span className="settings-option-arrow">›</span>
                    </button>

                    {/* Log out Option */}
                    {onSignOut && (
                      <button
                        className="settings-option-row settings-option-logout"
                        onClick={() => {
                          setOpen(false)
                          onSignOut()
                        }}
                      >
                        <span className="settings-option-icon">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                        </span>
                        <span>
                          <strong className="logout-text-danger">Log out</strong>
                          <small>Sign out of your account</small>
                        </span>
                        <span className="settings-option-arrow">›</span>
                      </button>
                    )}
                  </div>
                  <p className="settings-footer">Manage your appearance, store, and preferences.</p>
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
                      <span className="theme-preview theme-preview-light">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      <span className="theme-preview theme-preview-dark">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      </span>
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

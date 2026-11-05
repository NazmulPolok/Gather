import { useState } from 'react'
import { createPortal } from 'react-dom'

type Theme = 'light' | 'dark'

export function SettingsMenu({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<'main' | 'theme'>('main')

  function toggle() {
    if (!open) setPage('main')
    setOpen(value => !value)
  }

  return <>
    <div className="settings-menu">
      <button className={`settings-trigger ${open ? 'settings-trigger-open' : ''}`} aria-label="Settings" aria-expanded={open} onClick={toggle}>
        <span aria-hidden="true">⚙</span><span className="settings-trigger-label">Settings</span>
      </button>
    </div>
    {open && createPortal(<>
      <button className="settings-overlay" aria-label="Close settings" onClick={() => setOpen(false)} />
      <section className="settings-panel" role="dialog" aria-label="Settings">
        {page === 'main' ? <>
          <header>
            <div><strong>Settings</strong><small>Personalize your Gather experience</small></div>
            <button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">×</button>
          </header>
          <div className="settings-menu-list">
            <button className="settings-option-row" onClick={() => setPage('theme')}>
              <span className="settings-option-icon">◐</span>
              <span><strong>Theme</strong><small>{theme === 'light' ? 'Light' : 'Dark'}</small></span>
              <span className="settings-option-arrow">›</span>
            </button>
          </div>
          <p className="settings-footer">More options will arrive in future updates.</p>
        </> : <>
          <header className="settings-subheader">
            <button className="settings-back" onClick={() => setPage('main')} aria-label="Back to settings">‹</button>
            <div><strong>Theme</strong><small>Choose your appearance</small></div>
            <button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">×</button>
          </header>
          <div className="theme-choice-list">
            <button className={`theme-choice ${theme === 'light' ? 'theme-choice-selected' : ''}`} onClick={() => onThemeChange('light')}>
              <span className="theme-preview theme-preview-light">☀</span><span><strong>Light</strong><small>Bright and clear</small></span>{theme === 'light' && <b>✓</b>}
            </button>
            <button className={`theme-choice ${theme === 'dark' ? 'theme-choice-selected' : ''}`} onClick={() => onThemeChange('dark')}>
              <span className="theme-preview theme-preview-dark">☾</span><span><strong>Dark</strong><small>Easy on the eyes</small></span>{theme === 'dark' && <b>✓</b>}
            </button>
          </div>
        </>}
      </section>
    </>, document.body)}
  </>
}

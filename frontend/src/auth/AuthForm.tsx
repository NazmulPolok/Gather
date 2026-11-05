import { useState, type FormEvent } from 'react'
import { api, type AuthResponse } from '../api/client'

export function AuthForm({ onSignedIn }: { onSignedIn: (result: AuthResponse) => void }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = mode === 'signup'
        ? await api.signup(firstName.trim(), lastName.trim(), username.trim(), email.trim(), password)
        : await api.login(email.trim(), password)
      onSignedIn(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="story-label"><span className="story-spark">✳</span> A LITTLE CLOSER, EVERY DAY</div>
        <h1>Make space<br />for <em>your people.</em></h1>
        <p>Private corners for the conversations, plans, and photos you want to share with your group.</p>
        <div className="story-note"><div className="note-avatars"><span>J</span><span>M</span><span>A</span></div><span>Better together, wherever you are.</span></div>
        <div className="story-orbit orbit-one" /><div className="story-orbit orbit-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-heading"><p className="eyebrow">{mode === 'signup' ? 'YOUR NEXT CHAPTER STARTS HERE' : 'GOOD TO HAVE YOU BACK'}</p><h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2><p>{mode === 'signup' ? 'One account, all your groups.' : 'Sign in to catch up with your groups.'}</p></div>
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setError('') }}>Create account</button>
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && <>
            <label htmlFor="first-name">First name</label>
            <input id="first-name" autoComplete="given-name" maxLength={50} placeholder="First name" required value={firstName} onChange={e => setFirstName(e.target.value)} />
            <label htmlFor="last-name">Last name</label>
            <input id="last-name" autoComplete="family-name" maxLength={50} placeholder="Last name" required value={lastName} onChange={e => setLastName(e.target.value)} />
            <label htmlFor="username">Username</label>
            <input id="username" autoComplete="username" minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" placeholder="e.g. alex_24" required value={username} onChange={e => setUsername(e.target.value)} />
            <small>3–24 characters: letters, numbers, and underscores.</small>
          </>}
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          <div className="password-label"><label htmlFor="password">Password</label>{mode === 'signup' && <span>At least 8 characters</span>}</div>
          <input id="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="alert" role="alert">{error}</div>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? <><span className="button-spinner" />Working…</> : mode === 'signup' ? 'Create account →' : 'Sign in →'}</button>
        </form>
        <p className="terms-note">By continuing, you agree to keep your groups welcoming and respectful.</p>
      </section>
    </main>
  )
}

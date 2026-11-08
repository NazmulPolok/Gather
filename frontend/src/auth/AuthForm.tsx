import { useState, type FormEvent } from 'react'
import { api, type AuthResponse } from '../api/client'

export function AuthForm({ onSignedIn }: { onSignedIn: (result: AuthResponse) => void }) {
  const [mode, setMode] = useState<'signup' | 'login' | 'forgot'>('signup')
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request')
  const [email, setEmail] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  function resetToLogin() {
    setMode('login')
    setForgotStep('request')
    setError('')
    setNotice('')
    setOtp('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleRequestOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await api.requestResetOTP(email.trim())
      setTargetEmail(email.trim())
      setForgotStep('verify')
      setNotice('If an account matches, a verification code will be emailed shortly.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send verification code.')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (otp.trim().length !== 6 || !/^\d{6}$/.test(otp.trim())) {
      setError('Please enter the 6-digit numeric verification code.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setBusy(true)
    try {
      const result = await api.verifyResetOTP(targetEmail || email.trim(), otp.trim(), password)
      onSignedIn(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid or expired verification code.')
    } finally {
      setBusy(false)
    }
  }

  async function resendOTP() {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await api.requestResetOTP(targetEmail || email.trim())
      setNotice('If an account matches, a verification code will be emailed shortly.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resend code.')
    } finally {
      setBusy(false)
    }
  }

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
        <div className="auth-heading">
          <p className="eyebrow">
            {mode === 'signup'
              ? 'YOUR NEXT CHAPTER STARTS HERE'
              : mode === 'login'
              ? 'GOOD TO HAVE YOU BACK'
              : forgotStep === 'request'
              ? 'PASSWORD RECOVERY'
              : 'ENTER VERIFICATION CODE'}
          </p>
          <h2>
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'login'
              ? 'Welcome back'
              : forgotStep === 'request'
              ? 'Reset your password'
              : 'Verify code & set password'}
          </h2>
          <p>
            {mode === 'signup'
              ? 'One account, all your groups.'
              : mode === 'login'
              ? 'Sign in to catch up with your groups.'
              : forgotStep === 'request'
              ? 'Enter your registered email or username to receive a 6-digit OTP code.'
              : `Enter the 6-digit code sent to your account and choose a new password.`}
          </p>
        </div>

        {mode !== 'forgot' ? (
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setError('') }}>Create account</button>
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
          </div>
        ) : (
          <div className="auth-back-row">
            <button type="button" className="auth-back-button" onClick={resetToLogin}>
              ‹ Back to sign in
            </button>
          </div>
        )}

        {notice && <div className="alert alert-notice" role="status"><span>✓</span> {notice}</div>}
        {mode === 'forgot' && forgotStep === 'request' ? (
          <form className="auth-form" onSubmit={handleRequestOTP}>
            <label htmlFor="forgot-email">Email address or username</label>
            <input
              id="forgot-email"
              type="text"
              autoComplete="username"
              placeholder="you@example.com or username"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {error && <div className="alert" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy || !email.trim()}>
              {busy ? <><span className="button-spinner" />Sending code…</> : 'Send verification code (OTP) →'}
            </button>
          </form>
        ) : mode === 'forgot' && forgotStep === 'verify' ? (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <div className="target-account-badge">
              <span>Account: <strong>{targetEmail}</strong></span>
              <button
                type="button"
                className="link-btn"
                onClick={() => { setForgotStep('request'); setError(''); setNotice('') }}
              >
                Change
              </button>
            </div>

            <label htmlFor="otp-input">6-digit verification code</label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="e.g. 123456"
              required
              autoFocus
              className="otp-input"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />

            <div className="password-label">
              <label htmlFor="new-password">New password</label>
              <span>At least 8 characters</span>
            </div>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Enter new password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <label htmlFor="confirm-new-password">Confirm new password</label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Re-enter new password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />

            {error && <div className="alert" role="alert">{error}</div>}

            <button className="button button-primary auth-submit" disabled={busy || otp.length !== 6 || !password}>
              {busy ? <><span className="button-spinner" />Verifying…</> : 'Verify OTP & Reset Password →'}
            </button>

            <div className="otp-resend-row">
              <span>Didn't receive the code?</span>
              <button type="button" className="link-btn" onClick={resendOTP} disabled={busy}>
                Resend code
              </button>
            </div>
          </form>
        ) : (
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

            <div className="password-label">
              <label htmlFor="password">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {
                    setMode('forgot')
                    setForgotStep('request')
                    setError('')
                    setNotice('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                >
                  Forgot password?
                </button>
              )}
              {mode === 'signup' && <span>At least 8 characters</span>}
            </div>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={mode === 'signup' ? 8 : undefined}
              placeholder="Enter your password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && <div className="alert" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy}>
              {busy ? <><span className="button-spinner" />Working…</> : mode === 'signup' ? 'Create account →' : 'Sign in →'}
            </button>
          </form>
        )}
        <p className="terms-note">By continuing, you agree to keep your groups welcoming and respectful.</p>
      </section>
    </main>
  )
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, FlaskIcon, SpinnerIcon } from './icons/Icons.jsx'

const TOOL_URL = '../index.html'

// This is a UI-only gate, consistent with the rest of the site having no
// backend: there is nothing to authenticate against, so "Sign In" accepts
// any non-empty email/password and proceeds — a brief loading state is
// purely for perceived affordance, not real processing. "Demo Mode" skips
// straight through with zero friction, matching the copy under it.
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password || submitting) return
    setSubmitting(true)
    window.setTimeout(() => {
      window.location.href = TOOL_URL
    }, 550)
  }

  function handleDemoMode() {
    window.location.href = TOOL_URL
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate={false}>
      <label className="login-field">
        <MailIcon className="login-field-icon" />
        <input
          type="email"
          required
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <label className="login-field">
        <LockIcon className="login-field-icon" />
        <input
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <motion.button
          type="button"
          className="login-field-toggle"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showPassword ? (
              <motion.span key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <EyeOffIcon />
              </motion.span>
            ) : (
              <motion.span key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <EyeIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </label>

      <div className="login-row">
        <label className="login-remember">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Remember Me
        </label>
        <a
          href="#"
          className="login-forgot"
          onClick={(e) => e.preventDefault()}
        >
          Forgot Password?
        </a>
      </div>

      <motion.button
        type="submit"
        className="btn-primary"
        disabled={submitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {submitting ? (
            <motion.span key="loading" className="btn-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Signing in…
              <SpinnerIcon className="spin" />
            </motion.span>
          ) : (
            <motion.span key="idle" className="btn-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Sign In
              <ArrowRightIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="login-divider"><span>OR</span></div>

      <motion.button
        type="button"
        className="btn-outline"
        onClick={handleDemoMode}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <FlaskIcon />
        Demo Mode
      </motion.button>

      <p className="login-demo-copy">
        Explore the application instantly
        <br />
        No login required &bull; Perfect for judges
      </p>

      <p className="login-trust">🔒 Client-side only &bull; Nothing stored or transmitted</p>
    </form>
  )
}

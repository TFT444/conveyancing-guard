import { motion } from 'framer-motion'
import ShieldEmblem from './ShieldEmblem.jsx'
import LoginForm from './LoginForm.jsx'

export default function LoginCard({ variants }) {
  return (
    <motion.div className="login-card" variants={variants}>
      <div className="login-card-header">
        <ShieldEmblem size="sm" />
        <h1 className="login-card-title">
          CONVEYANCING<span>GUARD</span>
        </h1>
        <p className="login-card-subtitle">AI-Powered Payment Verification</p>
        <div className="login-card-divider" />
        <h2 className="login-card-welcome">Welcome Back</h2>
        <p className="login-card-hint">Sign in to continue</p>
      </div>

      <LoginForm />
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { ShieldCheckIcon } from './icons/Icons.jsx'

export default function VerifiedBadge({ variants }) {
  return (
    <motion.div className="verified-badge" variants={variants}>
      <ShieldCheckIcon className="verified-badge-icon" />
      <div className="verified-badge-text">
        <div>Secure Environment</div>
        <div className="verified-badge-status">
          <span className="verified-dot" />
          Verified
        </div>
      </div>
    </motion.div>
  )
}

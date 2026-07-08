import { motion } from 'framer-motion'
import { ShieldCheckIcon } from './icons/Icons.jsx'

// size: 'lg' (hero emblem, with rings + glow) | 'sm' (repeated inside the login card, static)
export default function ShieldEmblem({ size = 'lg', variants }) {
  if (size === 'sm') {
    return (
      <div className="shield-emblem shield-emblem-sm">
        <ShieldCheckIcon className="shield-emblem-icon" />
      </div>
    )
  }

  return (
    <motion.div className="shield-emblem-wrap" variants={variants}>
      <span className="shield-ring shield-ring-1" aria-hidden="true" />
      <span className="shield-ring shield-ring-2" aria-hidden="true" />
      <span className="shield-ring shield-ring-3" aria-hidden="true" />
      <div className="shield-emblem shield-emblem-lg">
        <span className="shield-glow" aria-hidden="true" />
        <ShieldCheckIcon className="shield-emblem-icon" />
      </div>
    </motion.div>
  )
}

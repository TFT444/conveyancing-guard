import { motion } from 'framer-motion'

// Custom 3D character art from the mockup can't be reproduced pixel-for-
// pixel (no image-generation tool available). This is a deliberately
// simplified, abstract guardian figure in the site's own visual language
// — same gradient/rounded-shape vocabulary as the brand mark — rather
// than an attempt at a literal likeness.
export default function Mascot({ variants }) {
  return (
    <motion.div className="mascot" variants={variants}>
      <svg className="mascot-figure" viewBox="0 0 200 320" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="mascotBody" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--accent-blue)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--accent-purple)" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* pointing arm */}
        <path d="M118 108 C150 88 165 60 172 34" stroke="var(--accent-blue-soft)" strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="173" cy="30" r="7" fill="var(--accent-blue-soft)" />

        {/* body */}
        <rect x="45" y="120" width="110" height="170" rx="46" fill="url(#mascotBody)" stroke="var(--border-strong)" strokeWidth="1.5" />

        {/* shield emblem on chest */}
        <path d="M100 165l16 6v14c0 10-7 16-16 19-9-3-16-9-16-19v-14l16-6z" fill="none" stroke="var(--accent-blue-soft)" strokeWidth="2" />

        {/* head */}
        <circle cx="100" cy="78" r="46" fill="url(#mascotBody)" stroke="var(--border-strong)" strokeWidth="1.5" />

        {/* face */}
        <circle cx="84" cy="76" r="4" fill="var(--text-primary)" />
        <circle cx="116" cy="76" r="4" fill="var(--text-primary)" />
        <path d="M84 96c6 7 26 7 32 0" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>

      <motion.div
        className="mascot-bubble"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <p>I&rsquo;ll help keep your payments safe.</p>
        <span>— CG</span>
      </motion.div>
    </motion.div>
  )
}

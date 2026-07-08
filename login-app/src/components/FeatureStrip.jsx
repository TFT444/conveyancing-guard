import { motion } from 'framer-motion'
import { ShieldCheckIcon, PeopleIcon, BoltIcon, LockIcon } from './icons/Icons.jsx'

const FEATURES = [
  {
    icon: ShieldCheckIcon,
    title: 'Prevent Fraud',
    body: 'Stop payment diversion fraud before it happens.',
  },
  {
    icon: PeopleIcon,
    title: 'Protect Clients',
    body: 'Keep your clients and their money safe.',
  },
  {
    icon: BoltIcon,
    title: 'Fast AI Analysis',
    body: 'The checker scans everything in seconds with clear, explainable results.',
  },
  {
    icon: LockIcon,
    title: 'Enterprise Security',
    body: 'Built with bank-level encryption and security standards.',
  },
]

export default function FeatureStrip({ variants, itemVariants }) {
  return (
    <motion.div className="feature-strip" variants={variants}>
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <motion.div className="feature-tile" key={title} variants={itemVariants}>
          <div className="feature-tile-icon">
            <Icon />
          </div>
          <h3>{title}</h3>
          <p>{body}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

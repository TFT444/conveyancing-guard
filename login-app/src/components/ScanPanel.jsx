import { motion } from 'framer-motion'
import { CheckIcon } from './icons/Icons.jsx'

const CHECKS = ['System Integrity', 'Network Security', 'Fraud Detection', 'Environment Safe']

export default function ScanPanel({ variants }) {
  return (
    <motion.div className="scan-panel" variants={variants}>
      <div className="scan-panel-title">AI Security Scan</div>
      <ul className="scan-panel-list">
        {CHECKS.map((label) => (
          <li key={label}>
            <span>{label}</span>
            <CheckIcon className="scan-check" />
          </li>
        ))}
      </ul>
      <div className="scan-panel-bar" />
      <div className="scan-panel-status">100% Secure</div>
    </motion.div>
  )
}

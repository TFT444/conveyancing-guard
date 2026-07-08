import { motion, useReducedMotion } from 'framer-motion'
import ParticleField from './components/ParticleField.jsx'
import ScanPanel from './components/ScanPanel.jsx'
import VerifiedBadge from './components/VerifiedBadge.jsx'
import ShieldEmblem from './components/ShieldEmblem.jsx'
import Mascot from './components/Mascot.jsx'
import LoginCard from './components/LoginCard.jsx'
import FeatureStrip from './components/FeatureStrip.jsx'
import './App.css'

const EASE = [0.4, 0, 0.2, 1]

function App() {
  const reduceMotion = useReducedMotion()
  const d = reduceMotion ? 0.01 : undefined

  const page = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  }
  const fadeDown = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : -12 },
    visible: { opacity: 1, y: 0, transition: { duration: d ?? 0.5, ease: EASE } },
  }
  const fadeScale = {
    hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: d ?? 0.6, ease: EASE } },
  }
  const fadeLeft = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : -20 },
    visible: { opacity: 1, x: 0, transition: { duration: d ?? 0.5, ease: EASE } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: d ?? 0.5, ease: EASE } },
  }
  const featureGroup = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  }

  return (
    <div className="login-page">
      <ParticleField />

      <motion.div className="login-page-inner" initial="hidden" animate="visible" variants={page}>
        <div className="login-top-bar">
          <ScanPanel variants={fadeDown} />
          <VerifiedBadge variants={fadeDown} />
        </div>

        <div className="login-hero">
          <ShieldEmblem size="lg" variants={fadeScale} />
        </div>

        <div className="login-main">
          <Mascot variants={fadeLeft} />
          <LoginCard variants={fadeUp} />
        </div>

        <FeatureStrip variants={featureGroup} itemVariants={fadeUp} />
      </motion.div>
    </div>
  )
}

export default App

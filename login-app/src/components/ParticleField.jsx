// Purely decorative, ambient background texture. Static in markup;
// all movement comes from CSS @keyframes (frozen under
// prefers-reduced-motion via the rule in App.css), so this never holds
// a JS animation frame loop running for the page's lifetime.
const DOTS = [
  { top: '8%', left: '12%', size: 3, delay: '0s', dur: '18s' },
  { top: '22%', left: '78%', size: 2, delay: '2s', dur: '22s' },
  { top: '65%', left: '6%', size: 2, delay: '4s', dur: '26s' },
  { top: '80%', left: '85%', size: 3, delay: '1s', dur: '20s' },
  { top: '40%', left: '92%', size: 2, delay: '6s', dur: '24s' },
  { top: '55%', left: '48%', size: 2, delay: '3s', dur: '28s' },
  { top: '15%', left: '45%', size: 2, delay: '5s', dur: '19s' },
  { top: '90%', left: '30%', size: 2, delay: '2.5s', dur: '23s' },
]

export default function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="particle-dot"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            animationDuration: d.dur,
          }}
        />
      ))}
      <svg className="particle-lines" viewBox="0 0 800 800" preserveAspectRatio="none">
        <line x1="60" y1="120" x2="260" y2="60" />
        <line x1="600" y1="80" x2="740" y2="220" />
        <line x1="80" y1="600" x2="220" y2="720" />
        <line x1="640" y1="620" x2="760" y2="520" />
      </svg>
    </div>
  )
}

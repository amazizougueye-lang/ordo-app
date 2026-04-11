import { motion } from 'framer-motion'

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    opacity: 0.02 + i * 0.008,
    width: 0.4 + i * 0.015,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="#1a1a2e"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.3, opacity: path.opacity * 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function BackgroundPaths({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(37,99,235,0.03)' }} />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(26,26,46,0.02)' }} />
    </div>
  )
}

// Spotlight effect that follows mouse
export function SpotlightBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Gradient mesh background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.04), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(26, 26, 46, 0.02), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(26, 26, 46, 0.01), transparent)
          `
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1a2e 1px, transparent 1px),
            linear-gradient(to bottom, #1a1a2e 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />
    </div>
  )
}

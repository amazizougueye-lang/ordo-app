import { motion } from 'framer-motion'

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.05 + i * 0.02})`,
    width: 0.5 + i * 0.02,
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
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ color: '#0F172A' }}
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
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
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(15, 23, 42, 0.03), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(15, 23, 42, 0.02), transparent)
          `
        }}
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0F172A 1px, transparent 1px),
            linear-gradient(to bottom, #0F172A 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px'
        }}
      />
    </div>
  )
}
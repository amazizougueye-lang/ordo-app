export function OrdoLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { text: 15, dot: 4 },
    md: { text: 18, dot: 5 },
    lg: { text: 26, dot: 7 },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div
        style={{
          width: s.dot,
          height: s.dot,
          borderRadius: '50%',
          background: '#1a1a2e',
        }}
      />
      <span
        style={{
          fontSize: s.text,
          fontWeight: 600,
          color: '#1a1a2e',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        ordo
      </span>
    </div>
  )
}

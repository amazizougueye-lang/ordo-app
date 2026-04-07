export function OrdoLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { text: 16, dot: 5 },
    md: { text: 20, dot: 6 },
    lg: { text: 28, dot: 8 },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div
        style={{
          width: s.dot,
          height: s.dot,
          borderRadius: '50%',
          background: '#1E293B',
        }}
      />
      <span
        style={{
          fontSize: s.text,
          fontWeight: 700,
          color: '#0F172A',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        ordo
      </span>
    </div>
  )
}

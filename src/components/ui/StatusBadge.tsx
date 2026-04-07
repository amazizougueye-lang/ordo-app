import type { CaseStatus } from '../../types'

interface StatusBadgeProps {
  status: CaseStatus
  showDot?: boolean
}

const config = {
  urgent: { label: 'Urgent', className: 'badge-urgent', dot: '#DC2626' },
  monitor: { label: 'Surveiller', className: 'badge-monitor', dot: '#D97706' },
  stable: { label: 'Actif', className: 'badge-stable', dot: '#16A34A' },
}

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const { label, className, dot } = config[status]
  return (
    <span className={className}>
      {showDot && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: dot,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  )
}

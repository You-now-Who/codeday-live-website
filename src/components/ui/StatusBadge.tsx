type Status = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

const statusConfig: Record<Status, { label: string; classes: string }> = {
  PENDING: {
    label: 'PENDING',
    classes: 'bg-white text-primary border-2 border-primary',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    classes: 'bg-secondary-fixed text-on-secondary-fixed border-2 border-primary',
  },
  RESOLVED: {
    label: 'RESOLVED',
    classes: 'bg-primary text-on-primary border-2 border-primary',
  },
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, classes } = statusConfig[status]
  return (
    <span className={`inline-block font-epilogue font-bold text-xs uppercase px-2 py-1 ${classes}`}>
      {label}
    </span>
  )
}

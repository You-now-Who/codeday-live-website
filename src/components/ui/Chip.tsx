interface ChipProps {
  label: string
  className?: string
}

export function Chip({ label, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-block bg-secondary-fixed text-on-secondary-fixed font-grotesk text-xs font-medium uppercase tracking-widest px-2 py-0.5 border border-primary rotate-[-1deg] ${className}`}
    >
      {label}
    </span>
  )
}

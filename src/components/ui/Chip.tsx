interface ChipProps {
  label: string
  className?: string
}

const ROTATIONS = ['rotate-[-1.5deg]', 'rotate-[1deg]', 'rotate-[-0.5deg]', 'rotate-[0.8deg]']

function getLabelRotation(label: string): string {
  const sum = label.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ROTATIONS[sum % ROTATIONS.length]
}

export function Chip({ label, className = '' }: ChipProps) {
  const rotation = getLabelRotation(label)
  return (
    <span
      className={`inline-block bg-secondary-fixed text-on-secondary-fixed font-grotesk text-xs font-medium uppercase tracking-widest px-2 py-0.5 border border-primary shadow-paper sketch-box ${rotation} ${className}`}
    >
      {label}
    </span>
  )
}

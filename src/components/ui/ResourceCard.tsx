import { Chip } from './Chip'

interface ResourceLink {
  id: string
  title: string
  url: string
  description: string | null
  category: string
}

interface ResourceCardProps {
  resource: ResourceLink
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div className="bg-white border border-primary/30 shadow-paper index-card sketch-box tape-corner p-4 relative">
      <div className="mb-2 border-b border-primary/10 pb-2">
        <Chip label={resource.category} className="stamp" />
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-epilogue font-bold text-base uppercase tracking-tight underline decoration-2 decoration-primary hover:decoration-secondary-fixed hover:bg-transparent transition-colors"
      >
        {resource.title}
      </a>
      {resource.description && (
        <p className="font-grotesk text-sm text-on-surface mt-2 leading-relaxed">{resource.description}</p>
      )}
    </div>
  )
}

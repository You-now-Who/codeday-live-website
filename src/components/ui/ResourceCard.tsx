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
    <div className="bg-white border-2 border-primary shadow-hard p-4 relative">
      <div className="absolute top-3 right-3">
        <Chip label={resource.category} />
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-epilogue font-bold text-base uppercase tracking-tight underline decoration-2 decoration-primary hover:bg-secondary-fixed transition-colors pr-16"
      >
        {resource.title}
      </a>
      {resource.description && (
        <p className="font-grotesk text-sm text-on-surface mt-2">{resource.description}</p>
      )}
    </div>
  )
}

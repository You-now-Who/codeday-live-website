interface Project {
  id: string
  teamName: string
  projectName: string
  description: string | null
  iframeUrl: string
  createdAt: string
}

const ROTATIONS = ['rotate-[-0.4deg]', 'rotate-[0.4deg]', 'rotate-[-0.8deg]', 'rotate-[0.8deg]', 'rotate-[0deg]']
const ACCENT_CLASSES = [
  'border-t-4 border-t-secondary-fixed',
  'border-t-4 border-t-primary',
  'border-l-4 border-l-secondary-fixed',
  'border-l-4 border-l-primary',
]

function hashStr(s: string) {
  return s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function domain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export function ProjectCard({ project }: { project: Project }) {
  const h = hashStr(project.id)
  const rotation = ROTATIONS[h % ROTATIONS.length]
  const accent = ACCENT_CLASSES[h % ACCENT_CLASSES.length]
  const init = initials(project.teamName)
  const badgeBg = h % 2 === 0 ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-primary text-on-primary'

  return (
    <article className={`border-2 border-primary bg-white shadow-hard flex flex-col ${rotation} ${accent}`}>

      {/* Header — team identity */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-primary/10">
        <span className={`w-9 h-9 flex items-center justify-center font-epilogue font-black text-sm flex-shrink-0 ${badgeBg}`}>
          {init}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-epilogue font-black text-sm uppercase tracking-tight leading-none truncate">
            {project.teamName}
          </p>
          <p className="font-grotesk text-xs text-outline mt-0.5">{timeAgo(project.createdAt)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 flex-1 flex flex-col gap-2">
        <h3 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-tight">
          {project.projectName}
        </h3>
        {project.description && (
          <p className="font-grotesk text-sm text-on-surface leading-snug line-clamp-3">
            {project.description}
          </p>
        )}
      </div>

      {/* Footer — URL + CTA */}
      <div className="px-4 pb-4 flex items-center justify-between gap-3 mt-auto">
        <span className="font-grotesk text-xs text-outline truncate">{domain(project.iframeUrl)}</span>
        <a
          href={project.iframeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 font-epilogue font-black text-xs uppercase tracking-tight border-2 border-primary px-3 py-1.5 hover:bg-secondary-fixed hover:border-secondary-fixed hover:text-on-secondary-fixed transition-colors"
        >
          VIEW →
        </a>
      </div>
    </article>
  )
}

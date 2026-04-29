interface Project {
  id: string
  teamName: string
  projectName: string
  description: string | null
  iframeUrl: string
}

interface ProjectCardProps {
  project: Project
}

const ROTATIONS = ['rotate-[-0.5deg]', 'rotate-[0.5deg]', 'rotate-[-1deg]', 'rotate-[1deg]']

function getRotation(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ROTATIONS[sum % ROTATIONS.length]
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className={`border-2 border-primary shadow-hard torn-edge-top bg-white ${getRotation(project.id)}`}>
      <div className="p-4">
        <h3 className="font-epilogue font-black text-xl uppercase tracking-tight leading-none">
          {project.teamName}
        </h3>
        <p className="font-grotesk text-sm font-medium mt-1">{project.projectName}</p>
        {project.description && (
          <p className="font-grotesk text-sm text-outline mt-1">{project.description}</p>
        )}
      </div>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={project.iframeUrl}
          className="absolute inset-0 w-full h-full border-t-2 border-primary"
          sandbox="allow-scripts allow-same-origin allow-forms"
          referrerPolicy="no-referrer"
          title={`${project.teamName} — ${project.projectName}`}
        />
      </div>
    </div>
  )
}

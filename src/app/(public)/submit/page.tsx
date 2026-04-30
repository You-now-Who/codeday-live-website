import { cookies } from 'next/headers'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'
import { prisma } from '@/lib/prisma'
import { TeamLoginForm } from '@/components/sections/TeamLoginForm'
import { TeamProjectForm } from '@/components/sections/TeamProjectForm'

export default async function SubmitPage() {
  const jar = await cookies()
  const token = jar.get(TEAM_SESSION_COOKIE)?.value

  if (!token) {
    return <TeamLoginForm />
  }

  const account = await getAccountFromToken(token)
  if (!account) {
    return <TeamLoginForm />
  }

  const [project, config] = await Promise.all([
    prisma.project.findUnique({ where: { teamAccountId: account.id } }),
    prisma.eventConfig.findUnique({ where: { id: '1' } }),
  ])

  const deadlinePassed = config?.submissionDeadline
    ? new Date() > config.submissionDeadline
    : false

  return (
    <TeamProjectForm
      account={{ id: account.id, username: account.username, displayName: account.displayName }}
      project={project ? JSON.parse(JSON.stringify(project)) : null}
      deadlinePassed={deadlinePassed}
    />
  )
}

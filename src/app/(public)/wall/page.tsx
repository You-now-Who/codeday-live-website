import { cookies } from 'next/headers'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'
import { prisma } from '@/lib/prisma'
import { WallClient } from '@/components/sections/WallClient'

export default async function WallPage() {
  const jar = await cookies()
  const token = jar.get(TEAM_SESSION_COOKIE)?.value
  const account = token ? await getAccountFromToken(token) : null

  const [rawProjects, config, userProject] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.eventConfig.findUnique({ where: { id: '1' } }),
    account
      ? prisma.project.findUnique({ where: { teamAccountId: account.id } })
      : Promise.resolve(null),
  ])

  const deadlinePassed = config?.submissionDeadline
    ? new Date() > config.submissionDeadline
    : false

  return (
    <WallClient
      account={account ? { id: account.id, username: account.username, displayName: account.displayName } : null}
      userProject={userProject ? JSON.parse(JSON.stringify(userProject)) : null}
      initialProjects={JSON.parse(JSON.stringify(rawProjects))}
      deadlinePassed={deadlinePassed}
    />
  )
}

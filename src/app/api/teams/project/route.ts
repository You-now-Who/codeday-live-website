import { NextRequest } from 'next/server'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Not logged in' }, { status: 401 })

  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Session expired — please log in again' }, { status: 401 })

  const config = await prisma.eventConfig.findUnique({ where: { id: '1' } })
  if (config?.submissionDeadline && new Date() > config.submissionDeadline) {
    return Response.json({ error: 'Submissions are closed — the deadline has passed' }, { status: 403 })
  }

  const { projectName, description, iframeUrl } = await req.json()

  if (!projectName?.trim()) {
    return Response.json({ error: 'Project name is required', field: 'projectName' }, { status: 400 })
  }
  if (projectName.trim().length > 200) {
    return Response.json({ error: 'Project name must be 200 characters or fewer', field: 'projectName' }, { status: 400 })
  }
  if (!iframeUrl || !/^https:\/\//.test(iframeUrl)) {
    return Response.json({ error: 'Project URL must start with https://', field: 'iframeUrl' }, { status: 400 })
  }

  const teamName = account.displayName ?? account.username

  const project = await prisma.project.upsert({
    where: { teamAccountId: account.id },
    update: {
      projectName: projectName.trim(),
      description: description?.trim() || null,
      iframeUrl: iframeUrl.trim(),
      teamName,
    },
    create: {
      teamName,
      projectName: projectName.trim(),
      description: description?.trim() || null,
      iframeUrl: iframeUrl.trim(),
      teamAccountId: account.id,
    },
  })

  return Response.json({ project }, { status: 201 })
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { teamName, projectName, description, iframeUrl, submitCode } = body

  // Validate submit code if one is configured
  const config = await prisma.eventConfig.findUnique({ where: { id: '1' } })
  if (config?.submitCode) {
    if (!submitCode || submitCode.trim().toLowerCase() !== config.submitCode.toLowerCase()) {
      return Response.json({ error: 'Invalid event code', field: 'submitCode' }, { status: 403 })
    }
  }

  // Validate deadline
  if (config?.submissionDeadline && new Date() > config.submissionDeadline) {
    return Response.json({ error: 'Submissions are closed — the deadline has passed' }, { status: 403 })
  }

  if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'Team name is required', field: 'teamName' }, { status: 400 })
  }
  if (teamName.trim().length > 200) {
    return Response.json({ error: 'Team name must be 200 characters or fewer', field: 'teamName' }, { status: 400 })
  }
  if (!projectName || typeof projectName !== 'string' || projectName.trim() === '') {
    return Response.json({ error: 'Project name is required', field: 'projectName' }, { status: 400 })
  }
  if (projectName.trim().length > 200) {
    return Response.json({ error: 'Project name must be 200 characters or fewer', field: 'projectName' }, { status: 400 })
  }
  if (!iframeUrl || typeof iframeUrl !== 'string' || !/^https:\/\//.test(iframeUrl)) {
    return Response.json({ error: 'Project URL must start with https://', field: 'iframeUrl' }, { status: 400 })
  }

  try {
    // Upsert so teams can update their submission
    const project = await prisma.project.upsert({
      where: { teamName: teamName.trim() },
      update: {
        projectName: projectName.trim(),
        description: description?.trim() ?? null,
        iframeUrl,
      },
      create: {
        teamName: teamName.trim(),
        projectName: projectName.trim(),
        description: description?.trim() ?? null,
        iframeUrl,
      },
    })
    return Response.json({ project }, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to save project' }, { status: 500 })
  }
}

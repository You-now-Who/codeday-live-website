import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return Response.json({ projects })
  } catch {
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { teamName, projectName, description, iframeUrl } = body

  if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'teamName is required', field: 'teamName' }, { status: 400 })
  }
  if (teamName.trim().length > 200) {
    return Response.json({ error: 'teamName must be 200 characters or fewer', field: 'teamName' }, { status: 400 })
  }
  if (!projectName || typeof projectName !== 'string' || projectName.trim() === '') {
    return Response.json({ error: 'projectName is required', field: 'projectName' }, { status: 400 })
  }
  if (projectName.trim().length > 200) {
    return Response.json({ error: 'projectName must be 200 characters or fewer', field: 'projectName' }, { status: 400 })
  }
  if (!iframeUrl || typeof iframeUrl !== 'string' || !/^https:\/\//.test(iframeUrl)) {
    return Response.json({ error: 'iframeUrl must use HTTPS', field: 'iframeUrl' }, { status: 400 })
  }

  try {
    const project = await prisma.project.create({
      data: {
        teamName: teamName.trim(),
        projectName: projectName.trim(),
        description: description?.trim() ?? null,
        iframeUrl,
      },
    })
    return Response.json(project, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return Response.json(
        { error: 'A project for this team already exists', field: 'teamName' },
        { status: 409 }
      )
    }
    return Response.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

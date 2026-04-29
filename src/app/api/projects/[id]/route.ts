import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { teamName, projectName, description, iframeUrl } = body
  const data: Record<string, unknown> = {}

  if (teamName !== undefined) {
    if (typeof teamName !== 'string' || teamName.trim() === '') {
      return Response.json({ error: 'teamName must be a non-empty string', field: 'teamName' }, { status: 400 })
    }
    data.teamName = teamName.trim()
  }
  if (projectName !== undefined) {
    if (typeof projectName !== 'string' || projectName.trim() === '') {
      return Response.json({ error: 'projectName must be a non-empty string', field: 'projectName' }, { status: 400 })
    }
    data.projectName = projectName.trim()
  }
  if (description !== undefined) data.description = description?.trim() ?? null
  if (iframeUrl !== undefined) {
    if (typeof iframeUrl !== 'string' || !/^https:\/\//.test(iframeUrl)) {
      return Response.json({ error: 'iframeUrl must use HTTPS', field: 'iframeUrl' }, { status: 400 })
    }
    data.iframeUrl = iframeUrl
  }

  try {
    const project = await prisma.project.update({ where: { id: params.id }, data })
    return Response.json(project)
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'P2025') return Response.json({ error: 'Not found' }, { status: 404 })
    if (err.code === 'P2002') {
      return Response.json(
        { error: 'A project for this team already exists', field: 'teamName' },
        { status: 409 }
      )
    }
    return Response.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.project.delete({ where: { id: params.id } })
    return Response.json({ success: true })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status, claimedBy } = body
  const data: Record<string, unknown> = {}

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return Response.json({ error: 'Invalid status value', field: 'status' }, { status: 400 })
    }
    if (status === 'IN_PROGRESS') {
      if (!claimedBy || typeof claimedBy !== 'string' || claimedBy.trim() === '') {
        return Response.json(
          { error: 'claimedBy is required when status is IN_PROGRESS', field: 'claimedBy' },
          { status: 400 }
        )
      }
      data.claimedBy = claimedBy.trim()
    }
    data.status = status
  }

  if (claimedBy !== undefined && status !== 'IN_PROGRESS') {
    data.claimedBy = claimedBy?.trim() ?? null
  }

  try {
    const helpRequest = await prisma.helpRequest.update({
      where: { id: params.id },
      data,
    })
    return Response.json(helpRequest)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ error: 'Failed to update help request' }, { status: 500 })
  }
}

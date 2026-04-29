import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

const STATUS_ORDER = { PENDING: 0, IN_PROGRESS: 1, RESOLVED: 2 } as const

export async function GET(request: NextRequest) {
  if (!checkAdminKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const requests = await prisma.helpRequest.findMany({
      orderBy: { createdAt: 'asc' },
    })
    const sorted = [...requests].sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    )
    return Response.json({ requests: sorted })
  } catch {
    return Response.json({ error: 'Failed to fetch help requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { teamName } = body

  if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'teamName is required', field: 'teamName' }, { status: 400 })
  }
  if (teamName.trim().length > 200) {
    return Response.json({ error: 'teamName must be 200 characters or fewer', field: 'teamName' }, { status: 400 })
  }

  try {
    const helpRequest = await prisma.helpRequest.create({
      data: {
        teamName: teamName.trim(),
        status: 'PENDING',
      },
    })
    return Response.json(
      {
        id: helpRequest.id,
        teamName: helpRequest.teamName,
        status: helpRequest.status,
        createdAt: helpRequest.createdAt,
      },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: 'Failed to create help request' }, { status: 500 })
  }
}

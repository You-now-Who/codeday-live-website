import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account || (account.role !== 'MENTOR' && account.role !== 'ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status } = await req.json()
  if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const name = account.displayName ?? account.username
  const updated = await prisma.helpRequest.update({
    where: { id: params.id },
    data: {
      status,
      claimedBy: status === 'IN_PROGRESS' ? name : status === 'RESOLVED' ? name : undefined,
    },
  })
  return Response.json({ request: updated })
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

async function requireMentor(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return null
  const account = await getAccountFromToken(token)
  if (!account || (account.role !== 'MENTOR' && account.role !== 'ADMIN')) return null
  return account
}

export async function GET(req: NextRequest) {
  const account = await requireMentor(req)
  if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const requests = await prisma.helpRequest.findMany({
    where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
    orderBy: { createdAt: 'asc' },
  })
  return Response.json({ requests })
}

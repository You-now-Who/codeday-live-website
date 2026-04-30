import { NextRequest } from 'next/server'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ account: null })

  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ account: null })

  const project = await prisma.project.findUnique({ where: { teamAccountId: account.id } })
  return Response.json({ account: { id: account.id, username: account.username, displayName: account.displayName, role: account.role }, project })
}

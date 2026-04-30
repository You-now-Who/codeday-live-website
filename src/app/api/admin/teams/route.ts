import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'
import { hashPassword } from '@/lib/teamAuth'

export async function GET(req: NextRequest) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const accounts = await prisma.teamAccount.findMany({
    orderBy: { createdAt: 'asc' },
    include: { project: { select: { projectName: true, iframeUrl: true } } },
  })

  return Response.json({
    accounts: accounts.map(a => ({
      id: a.id,
      username: a.username,
      displayName: a.displayName,
      createdAt: a.createdAt,
      project: a.project ?? null,
    })),
  })
}

export async function POST(req: NextRequest) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, displayName, password } = await req.json()

  if (!username?.trim()) return Response.json({ error: 'Username is required', field: 'username' }, { status: 400 })
  if (username.trim().length > 50) return Response.json({ error: 'Username must be 50 characters or fewer', field: 'username' }, { status: 400 })
  if (!password) return Response.json({ error: 'Password is required', field: 'password' }, { status: 400 })
  if (password.length < 4) return Response.json({ error: 'Password must be at least 4 characters', field: 'password' }, { status: 400 })

  const normalised = username.trim().toLowerCase()

  const existing = await prisma.teamAccount.findUnique({ where: { username: normalised } })
  if (existing) return Response.json({ error: 'Username already taken', field: 'username' }, { status: 409 })

  const passwordHash = await hashPassword(password)
  const account = await prisma.teamAccount.create({
    data: {
      username: normalised,
      passwordHash,
      displayName: displayName?.trim() || null,
    },
  })

  return Response.json({ account: { id: account.id, username: account.username, displayName: account.displayName } }, { status: 201 })
}

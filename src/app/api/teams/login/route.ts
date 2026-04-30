import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, makeSessionCookie } from '@/lib/teamAuth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const account = await prisma.teamAccount.findUnique({
    where: { username: username.trim().toLowerCase() },
  })

  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    return Response.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = await createSession(account.id)
  const res = Response.json({
    ok: true,
    displayName: account.displayName ?? account.username,
  })
  res.headers.set('Set-Cookie', makeSessionCookie(token))
  return res
}

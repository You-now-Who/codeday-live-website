import { NextRequest } from 'next/server'
import { getAccountFromToken, TEAM_SESSION_COOKIE, hashPassword, verifyPassword } from '@/lib/teamAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Not logged in' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Session expired' }, { status: 401 })

  const { displayName, currentPassword, newPassword } = await req.json()
  const data: Record<string, unknown> = {}

  if (displayName !== undefined) {
    if (typeof displayName !== 'string') return Response.json({ error: 'Invalid display name' }, { status: 400 })
    data.displayName = displayName.trim() || null
  }

  if (newPassword !== undefined) {
    if (!currentPassword) return Response.json({ error: 'Current password is required', field: 'currentPassword' }, { status: 400 })
    const valid = await verifyPassword(currentPassword, account.passwordHash)
    if (!valid) return Response.json({ error: 'Current password is incorrect', field: 'currentPassword' }, { status: 403 })
    if (newPassword.length < 4) return Response.json({ error: 'New password must be at least 4 characters', field: 'newPassword' }, { status: 400 })
    data.passwordHash = await hashPassword(newPassword)
  }

  if (Object.keys(data).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })

  const updated = await prisma.teamAccount.update({ where: { id: account.id }, data })
  return Response.json({ account: { id: updated.id, username: updated.username, displayName: updated.displayName } })
}

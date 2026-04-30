import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'
import { hashPassword } from '@/lib/teamAuth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.teamAccount.delete({ where: { id: params.id } }).catch(() => {})
  return Response.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json()
  if (!password || password.length < 4) {
    return Response.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  await prisma.teamAccount.update({ where: { id: params.id }, data: { passwordHash } })
  return Response.json({ ok: true })
}

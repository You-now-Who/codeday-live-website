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

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.password !== undefined) {
    if (!body.password || body.password.length < 4) {
      return Response.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
    }
    data.passwordHash = await hashPassword(body.password)
  }

  if (body.role !== undefined) {
    if (!['TEAM', 'MENTOR', 'ADMIN'].includes(body.role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 })
    }
    data.role = body.role
  }

  if (Object.keys(data).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })

  await prisma.teamAccount.update({ where: { id: params.id }, data })
  return Response.json({ ok: true })
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return Response.json({ error: 'Not logged in' }, { status: 401 })
  const account = await getAccountFromToken(token)
  if (!account) return Response.json({ error: 'Session expired' }, { status: 401 })

  const comment = await prisma.comment.findUnique({ where: { id: params.commentId } })
  if (!comment) return Response.json({ error: 'Comment not found' }, { status: 404 })

  const canDelete = comment.teamAccountId === account.id || account.role === 'ADMIN' || account.role === 'MENTOR'
  if (!canDelete) return Response.json({ error: 'Not allowed' }, { status: 403 })

  await prisma.comment.delete({ where: { id: params.commentId } })
  return Response.json({ ok: true })
}

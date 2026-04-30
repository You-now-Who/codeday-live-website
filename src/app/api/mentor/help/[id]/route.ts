import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { status, claimedBy } = await req.json()
  if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await prisma.helpRequest.update({
    where: { id: params.id },
    data: { status, claimedBy: claimedBy ?? null },
  })
  return Response.json({ request: updated })
}

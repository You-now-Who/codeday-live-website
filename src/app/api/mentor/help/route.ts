import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminKey } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!checkAdminKey(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const requests = await prisma.helpRequest.findMany({
    where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
    orderBy: { createdAt: 'asc' },
  })
  return Response.json({ requests })
}

import { prisma } from '@/lib/prisma'
import { SubmitForm } from '@/components/sections/SubmitForm'

export default async function SubmitPage() {
  const config = await prisma.eventConfig.findUnique({ where: { id: '1' } })
  const deadlinePassed = config?.submissionDeadline
    ? new Date() > config.submissionDeadline
    : false
  const requiresCode = !!(config?.submitCode)
  return <SubmitForm deadlinePassed={deadlinePassed} requiresCode={requiresCode} />
}

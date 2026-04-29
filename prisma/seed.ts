import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.eventConfig.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      eventName: 'CodeDay London',
      submissionDeadline: new Date('2025-06-01T16:00:00Z'),
      importantLinks: [],
    },
  })
  console.log('Seed complete: EventConfig singleton created')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const convs = await prisma.conversation.findMany({
  where: { channel: 'FACEBOOK' },
  include: { messages: { orderBy: { createdAt: 'desc' }, take: 3 } },
  orderBy: { createdAt: 'desc' },
  take: 5
})

if (convs.length === 0) {
  console.log('❌ No Facebook conversations found yet.')
} else {
  console.log(`✅ Found ${convs.length} Facebook conversation(s):\n`)
  for (const c of convs) {
    console.log(`Conversation ${c.id}`)
    console.log(`  externalId: ${c.externalId}`)
    console.log(`  status:     ${c.status}`)
    console.log(`  createdAt:  ${c.createdAt}`)
    console.log(`  messages:`)
    for (const m of c.messages) {
      console.log(`    [${m.direction}] "${m.content}" — ${m.createdAt}`)
    }
    console.log()
  }
}

await prisma.$disconnect()

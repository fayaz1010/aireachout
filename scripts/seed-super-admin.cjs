const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const email = "admin@aireachout.com"
  const password = "AiReachout@2025!"

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      firstName: "Super",
      lastName: "Admin",
      subscriptionStatus: "ACTIVE",
      currentPlan: "ENTERPRISE",
    },
    create: {
      email,
      password: hashed,
      name: "Super Admin",
      firstName: "Super",
      lastName: "Admin",
      companyName: "AIReachout",
      role: "SUPER_ADMIN",
      subscriptionStatus: "ACTIVE",
      currentPlan: "ENTERPRISE",
    },
  })

  console.log("Super admin created/updated:")
  console.log("   Email:    " + user.email)
  console.log("   Password: " + password)
  console.log("   Role:     " + user.role)
  console.log("   Plan:     " + user.currentPlan)
  console.log("   ID:       " + user.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

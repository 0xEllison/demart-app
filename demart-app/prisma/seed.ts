import { hash } from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 创建测试用户
  const password = await hash("password123", 10)
  
  const user = await prisma.user.upsert({
    where: {
      email: "test@example.com",
    },
    update: {},
    create: {
      email: "test@example.com",
      name: "测试用户",
      password,
      emailVerified: new Date(),
    },
  })

  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 
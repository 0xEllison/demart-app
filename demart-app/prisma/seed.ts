import bcryptjs from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 清理现有数据
  console.log("清理现有数据...")
  
  // 先删除依赖其他表的数据
  await prisma.message.deleteMany()
  
  // 删除ConversationParticipant表数据
  try {
    // @ts-ignore - 忽略类型错误
    await prisma.conversationParticipant.deleteMany()
  } catch (error) {
    console.log("删除ConversationParticipant失败，可能表不存在")
  }
  
  await prisma.conversation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log("创建测试用户...")
  // 创建测试用户
  const password = await bcryptjs.hash("password123", 10)
  
  // 创建买家用户
  const buyer = await prisma.user.create({
    data: {
      email: "buyer@example.com",
      name: "测试买家",
      password,
      emailVerified: new Date(),
      image: "/images/avatar-1.png",
    },
  })

  // 创建多个卖家用户
  const seller1 = await prisma.user.create({
    data: {
      email: "seller1@example.com",
      name: "电子产品卖家",
      password,
      emailVerified: new Date(),
      image: "/images/avatar-2.png",
    },
  })

  const seller2 = await prisma.user.create({
    data: {
      email: "seller2@example.com",
      name: "游戏物品卖家",
      password,
      emailVerified: new Date(),
      image: "/images/avatar-3.png",
    },
  })

  const seller3 = await prisma.user.create({
    data: {
      email: "seller3@example.com",
      name: "设计服务卖家",
      password,
      emailVerified: new Date(),
      image: "/images/avatar-2.png",
    },
  })

  console.log("创建商品数据...")
  // 创建商品数据
  const product1 = await prisma.product.create({
    data: {
      title: "MacBook Air M3",
      description: "全新的MacBook Air M3，8核CPU，10核GPU，16GB内存，512GB SSD。\n\n这款MacBook Air配备了Apple最新的M3芯片，性能强大，续航出色，是学习、工作和娱乐的理想选择。\n\n产品特点：\n- M3芯片，8核CPU，10核GPU\n- 16GB统一内存\n- 512GB SSD存储\n- 13.6英寸Liquid视网膜显示屏\n- 两个雷电接口\n- MagSafe 3充电接口\n- 1080p FaceTime HD相机\n- 背光妙控键盘\n- 触控ID\n- 力度触控板",
      price: 9999,
      images: ["/images/m3-macbook-air-overhead-2.webp"],
      location: "中国",
      sellerId: seller1.id,
      status: "ACTIVE",
    },
  })

  const product2 = await prisma.product.create({
    data: {
      title: "Minecraft 钻石剑",
      description: "Minecraft 钻石剑玩具，1:1还原游戏中的道具，适合收藏或Cosplay使用。\n\n材质：优质塑料\n尺寸：60cm长\n重量：约500g\n\n由于是二手物品，有轻微使用痕迹，但整体状况良好。",
      price: 199,
      images: ["/images/minecraft-diamond-sword.jpeg"],
      location: "日本",
      sellerId: seller2.id,
      status: "ACTIVE",
    },
  })

  const product3 = await prisma.product.create({
    data: {
      title: "Logo设计服务（3天交付）",
      description: "专业Logo设计服务，3天内交付。\n\n服务内容：\n- 3个初始概念设计\n- 无限次修改，直到满意\n- 提供多种格式文件（AI、PSD、PNG、JPG等）\n- 商标使用权\n\n我有8年设计经验，曾为多家知名企业提供设计服务。",
      price: 200,
      images: ["/images/avatar-1.png"], // 临时使用头像作为服务图片
      location: "全球",
      sellerId: seller3.id,
      status: "ACTIVE",
    },
  })

  console.log("数据创建完成！")
  console.log({
    buyer: { id: buyer.id, name: buyer.name, email: buyer.email },
    sellers: [
      { id: seller1.id, name: seller1.name, email: seller1.email },
      { id: seller2.id, name: seller2.name, email: seller2.email },
      { id: seller3.id, name: seller3.name, email: seller3.email },
    ],
    products: [
      { id: product1.id, title: product1.title },
      { id: product2.id, title: product2.title },
      { id: product3.id, title: product3.title },
    ],
  })
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
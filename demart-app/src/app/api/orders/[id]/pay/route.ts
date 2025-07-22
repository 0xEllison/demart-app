import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// 生成随机交易哈希
function generateTxHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// 模拟支付处理
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 获取订单
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
        buyerId: session.user.id // 只有买家可以支付
      }
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    if (order.status !== "AWAITING_PAYMENT") {
      return new NextResponse("Order cannot be paid", { status: 400 })
    }

    // 生成模拟交易哈希
    const txHash = generateTxHash()

    // 更新订单状态为等待确认
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "PENDING_CONFIRMATION",
        txHash
      }
    })

    // 模拟区块链确认延迟（5-15秒）
    const confirmationDelay = Math.floor(Math.random() * 10 + 5) * 1000

    // 异步处理确认
    setTimeout(async () => {
      try {
        await prisma.order.update({
          where: { id: params.id },
          data: {
            status: "PAYMENT_CONFIRMED"
          }
        })
        console.log(`Order ${params.id} payment confirmed after ${confirmationDelay}ms`)
      } catch (error) {
        console.error("Error confirming payment:", error)
      }
    }, confirmationDelay)

    return NextResponse.json({
      success: true,
      txHash,
      status: "PENDING_CONFIRMATION",
      estimatedConfirmationTime: confirmationDelay
    })
  } catch (error) {
    console.error("[PAYMENT_PROCESS_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
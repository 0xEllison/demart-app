import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// 获取订单列表
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // "buy" | "sell"
    const status = searchParams.get("status")

    let whereClause: any = {}

    if (type === "buy") {
      whereClause.buyerId = session.user.id
    } else if (type === "sell") {
      whereClause.sellerId = session.user.id
    } else {
      // 默认获取所有相关订单
      whereClause.OR = [
        { buyerId: session.user.id },
        { sellerId: session.user.id }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, email: true, image: true }
        },
        seller: {
          select: { id: true, name: true, email: true, image: true }
        },
        address: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("[ORDERS_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// 创建新订单
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { productId, addressId, quantity = 1, notes } = body

    // 验证商品存在且可购买
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    if (product.status !== "ACTIVE") {
      return new NextResponse("Product not available", { status: 400 })
    }

    if (product.sellerId === session.user.id) {
      return new NextResponse("Cannot buy your own product", { status: 400 })
    }

    // 验证地址存在且属于当前用户
    const address = await prisma.address.findUnique({
      where: {
        id: addressId,
        userId: session.user.id
      }
    })

    if (!address) {
      return new NextResponse("Invalid address", { status: 400 })
    }

    // 计算订单金额
    const price = product.price
    const totalAmount = price * quantity

    // 创建订单
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: product.sellerId,
        productId,
        addressId,
        quantity,
        price,
        totalAmount,
        currency: product.currency,
        notes
      },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, email: true, image: true }
        },
        seller: {
          select: { id: true, name: true, email: true, image: true }
        },
        address: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("[ORDER_CREATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
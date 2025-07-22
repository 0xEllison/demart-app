import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// 获取单个订单详情
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { 
        id: params.id,
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id }
        ]
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

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("[ORDER_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// 更新订单状态
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { status, price, notes } = body

    // 获取当前订单
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: params.id,
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id }
        ]
      }
    })

    if (!existingOrder) {
      return new NextResponse("Order not found", { status: 404 })
    }

    // 权限检查：只有卖家可以在支付前修改价格
    if (price !== undefined && existingOrder.sellerId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 状态检查：只能在待支付状态下修改价格
    if (price !== undefined && existingOrder.status !== "AWAITING_PAYMENT") {
      return new NextResponse("Cannot modify price after payment", { status: 400 })
    }

    let updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (price !== undefined) {
      updateData.price = price
      updateData.totalAmount = price * existingOrder.quantity
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("[ORDER_UPDATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
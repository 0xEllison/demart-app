import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// 获取商品列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const query = searchParams.get("q")
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") || "active"

    // 构建查询条件
    const where: any = {
      status,
    }

    if (category) {
      where.category = category
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ]
    }

    if (userId) {
      where.userId = userId
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("[PRODUCTS_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// 创建新商品
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, price, condition, category, tags, images } = body

    // 简单验证
    if (!title || !price || !condition || !category) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price.toString()),
        condition,
        category,
        tags: tags || [],
        images: images || [],
        userId: session.user.id,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("[PRODUCTS_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
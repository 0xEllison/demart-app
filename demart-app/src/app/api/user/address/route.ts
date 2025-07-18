import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// 获取地址列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("[ADDRESS_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// 添加新地址
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, phone, province, city, district, address, isDefault } = body

    // 如果设置为默认地址，先将其他地址的默认状态取消
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        province,
        city,
        district,
        address,
        isDefault,
      },
    })

    return NextResponse.json(newAddress)
  } catch (error) {
    console.error("[ADDRESS_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// 更新地址
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, name, phone, province, city, district, address, isDefault } = body

    // 验证地址所有权
    const existingAddress = await prisma.address.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // 如果设置为默认地址，先将其他地址的默认状态取消
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const updatedAddress = await prisma.address.update({
      where: {
        id,
      },
      data: {
        name,
        phone,
        province,
        city,
        district,
        address,
        isDefault,
      },
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error("[ADDRESS_PATCH_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// 删除地址
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const addressId = searchParams.get("id")

    if (!addressId) {
      return new NextResponse("Missing address ID", { status: 400 })
    }

    // 验证地址所有权
    const existingAddress = await prisma.address.findUnique({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ADDRESS_DELETE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name } = await req.json()

    // 验证数据
    if (typeof name !== 'string' || name.trim() === '') {
      return new NextResponse("昵称不能为空", { status: 400 })
    }

    // 更新用户资料
    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name.trim(),
      },
    })

    // 返回更新后的用户信息
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
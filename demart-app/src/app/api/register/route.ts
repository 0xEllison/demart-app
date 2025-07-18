import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email) {
      return new NextResponse("邮箱不能为空", { status: 400 })
    }

    if (!password) {
      return new NextResponse("密码不能为空", { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new NextResponse("邮箱格式不正确", { status: 400 })
    }

    // 验证密码强度
    if (password.length < 6) {
      return new NextResponse("密码长度不能少于6位", { status: 400 })
    }

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return new NextResponse("该邮箱已被注册", { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return new NextResponse("注册失败，请稍后重试", { status: 500 })
  }
} 
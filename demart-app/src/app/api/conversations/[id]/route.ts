import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// 获取单个会话
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 验证用户是否是会话的参与者
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        participants: {
          some: {
            id: session.user.id
          }
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          }
        }
      }
    })

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("[CONVERSATION_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 
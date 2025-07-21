import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * 获取单个会话详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const conversationId = params.id;

    // 检查会话是否存在，并且当前用户是否是参与者
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    // 转换数据格式
    const formattedConversation = {
      id: conversation.id,
      participants: conversation.participants.map((p) => p.user),
      product: conversation.product,
      updatedAt: conversation.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    console.error("获取会话详情失败:", error);
    return NextResponse.json(
      { error: "获取会话详情失败" },
      { status: 500 }
    );
  }
} 
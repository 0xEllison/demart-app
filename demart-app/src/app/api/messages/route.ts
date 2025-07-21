import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendSystemMessage } from "@/lib/socket-client";

/**
 * 获取会话中的消息
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "缺少必要参数: conversationId" },
        { status: 400 }
      );
    }

    // 检查用户是否是会话的参与者
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    });

    if (!isParticipant) {
      return NextResponse.json(
        { error: "无权访问此会话" },
        { status: 403 }
      );
    }

    // 获取会话中的所有消息
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 将未读消息标记为已读
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("获取消息失败:", error);
    return NextResponse.json(
      { error: "获取消息失败" },
      { status: 500 }
    );
  }
}

/**
 * 发送新消息
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { conversationId, content, receiverId, type = "TEXT" } = await request.json();

    // 验证参数
    if (!conversationId || !content || !receiverId) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 检查用户是否是会话的参与者
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
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "无权访问此会话" },
        { status: 403 }
      );
    }

    // 创建新消息
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: session.user.id,
        receiverId,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 更新会话的更新时间
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // 如果是系统消息，使用Socket.io发送
    if (type === "SYSTEM") {
      try {
        sendSystemMessage({
          conversationId,
          content,
        });
      } catch (error) {
        console.error("Socket 系统消息发送失败:", error);
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("发送消息失败:", error);
    return NextResponse.json(
      { error: "发送消息失败" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * 获取当前用户的所有会话
 */
export async function GET() {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);

    // 如果未登录，返回401
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取当前用户参与的所有会话
    const conversations = await prisma.conversation.findMany({
      where: {
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
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 转换数据格式
    const formattedConversations = conversations.map((conversation) => {
      return {
        id: conversation.id,
        participants: conversation.participants.map((p) => p.user),
        product: conversation.product,
        messages: conversation.messages,
        updatedAt: conversation.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("获取会话列表失败:", error);
    return NextResponse.json(
      { error: "获取会话列表失败" },
      { status: 500 }
    );
  }
}

/**
 * 创建新会话
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("当前会话:", session);

    if (!session?.user?.id) {
      console.log("未授权: 用户未登录");
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 确认当前登录用户存在于数据库中
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      console.log("当前登录用户在数据库中不存在:", session.user.id);
      return NextResponse.json({ error: "当前用户不存在" }, { status: 404 });
    }

    console.log("当前用户存在:", currentUser);

    const body = await request.json();
    const { userId, productId } = body;
    console.log("请求参数:", { userId, productId });

    // 验证参数
    if (!userId) {
      console.log("缺少必要参数: userId");
      return NextResponse.json(
        { error: "缺少必要参数: userId" },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!otherUser) {
      console.log("对方用户不存在:", userId);
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    console.log("对方用户存在:", otherUser);

    // 检查是否已存在相同的会话
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
        AND: [
          {
            participants: {
              some: {
                userId: userId,
              },
            },
          },
          ...(productId ? [{ productId }] : []),
        ],
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
      },
    });

    // 如果已存在会话，直接返回
    if (existingConversation) {
      console.log("会话已存在，直接返回:", existingConversation.id);
      return NextResponse.json({
        id: existingConversation.id,
        participants: existingConversation.participants.map((p) => p.user),
      });
    }

    // 检查商品是否存在
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      
      if (!product) {
        console.log("商品不存在:", productId);
        return NextResponse.json({ error: "商品不存在" }, { status: 404 });
      }
      
      console.log("商品存在:", product.id);
    }

    console.log("开始创建新会话");
    console.log("参与者:", [session.user.id, userId]);

    // 创建新会话
    const newConversation = await prisma.conversation.create({
      data: {
        ...(productId ? { productId } : {}),
        participants: {
          create: [
            { userId: session.user.id },
            { userId: userId },
          ],
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
      },
    });

    console.log("会话创建成功:", newConversation.id);

    // 创建一条系统消息，表示会话已创建
    await prisma.message.create({
      data: {
        content: "会话已创建",
        conversationId: newConversation.id,
        senderId: session.user.id,
        receiverId: userId,
        type: "SYSTEM",
      },
    });

    console.log("系统消息创建成功");

    return NextResponse.json({
      id: newConversation.id,
      participants: newConversation.participants.map((p) => p.user),
    });
  } catch (error) {
    console.error("创建会话失败:", error);
    return NextResponse.json({ error: "创建会话失败" }, { status: 500 });
  }
} 
import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiResponse } from "next";

/**
 * 这个文件处理 Socket.io 的服务器端连接
 * 注意：在 Next.js App Router 中，这个文件实际上不会被直接调用
 * 而是通过 Socket.io 客户端的连接请求触发
 */

// 全局变量，用于存储 Socket.io 实例
let io: SocketIOServer | undefined;

// 处理 Socket.io 连接
export async function GET(req: NextRequest, res: NextApiResponse) {
  if (!io) {
    // 获取 res.socket.server
    const httpServer: NetServer = (res as any).socket?.server;

    // 如果没有找到 httpServer，返回错误
    if (!httpServer) {
      return new Response("Internal Server Error", { status: 500 });
    }

    // 创建 Socket.io 服务器
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // 处理连接
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // 加入会话
      socket.on("join-conversation", ({ conversationId }) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      // 离开会话
      socket.on("leave-conversation", ({ conversationId }) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      // 发送消息
      socket.on("send-message", (data) => {
        const { conversationId } = data;
        // 将消息广播给同一会话中的所有客户端（除了发送者）
        socket.to(conversationId).emit("new-message", data);
        console.log(`Message sent in conversation ${conversationId}`);
      });

      // 断开连接
      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });
  }

  return new Response("Socket.io server is running", { status: 200 });
}

// 防止 Next.js 缓存此路由
export const dynamic = "force-dynamic"; 
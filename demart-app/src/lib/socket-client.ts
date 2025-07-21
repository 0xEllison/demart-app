import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * 初始化 Socket.io 连接
 */
export function initSocket(): Socket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      path: "/api/socket",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket.io 连接成功");
    });

    socket.on("disconnect", () => {
      console.log("Socket.io 连接断开");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.io 连接错误:", error);
    });
  }

  return socket;
}

/**
 * 加入会话
 */
export function joinConversation(conversationId: string): void {
  if (socket) {
    socket.emit("join-conversation", { conversationId });
  }
}

/**
 * 离开会话
 */
export function leaveConversation(conversationId: string): void {
  if (socket) {
    socket.emit("leave-conversation", { conversationId });
  }
}

/**
 * 发送消息
 */
export function sendMessage(data: {
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
}): void {
  if (socket) {
    socket.emit("send-message", data);
  }
}

/**
 * 发送系统消息
 */
export function sendSystemMessage(data: {
  conversationId: string;
  content: string;
}): void {
  if (socket) {
    socket.emit("send-system-message", data);
  }
}

/**
 * 关闭 Socket.io 连接
 */
export function closeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
} 
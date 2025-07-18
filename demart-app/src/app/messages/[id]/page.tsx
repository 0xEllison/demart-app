"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { initSocket, joinConversation, leaveConversation, sendMessage } from "@/lib/socket-client"
import { Socket } from "socket.io-client"

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  receiverId: string
  isRead: boolean
  sender: {
    id: string
    name: string
    image: string
  }
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    image: string
  }[]
  product?: {
    id: string
    title: string
    images: string[]
    price: number
  } | null
  updatedAt: string
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // 只有当会话状态确定后才进行操作
    if (status === "loading") return;
    
    // 如果未登录，重定向到登录页面
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    // 已登录，初始化聊天
    if (status === "authenticated" && session?.user) {
      fetchConversation();
      fetchMessages();
      
      // 初始化Socket连接
      try {
        socketRef.current = initSocket();
        
        // 加入会话
        joinConversation(params.id);
        
        // 监听新消息
        socketRef.current?.on('new-message', (data: {
          conversationId: string
          content: string
          senderId: string
          receiverId: string
        }) => {
          if (data.conversationId === params.id) {
            // 如果是当前会话的消息，则添加到消息列表
            fetchMessages();
          }
        });
      } catch (error) {
        console.error("Socket 初始化失败:", error);
      }
      
      return () => {
        // 离开会话
        try {
          leaveConversation(params.id);
          
          // 移除事件监听
          if (socketRef.current) {
            socketRef.current.off('new-message');
          }
        } catch (error) {
          console.error("Socket 清理失败:", error);
        }
      };
    }
  }, [status, session, params.id, router]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchConversation() {
    try {
      setLoading(true)
      const response = await fetch(`/api/conversations/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/messages")
          return
        }
        throw new Error("获取会话失败")
      }
      
      const data = await response.json()
      setConversation(data)
    } catch (error) {
      console.error("获取会话失败:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages() {
    try {
      const response = await fetch(`/api/messages?conversationId=${params.id}`)
      
      if (!response.ok) {
        throw new Error("获取消息失败")
      }
      
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("获取消息失败:", error)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!messageInput.trim() || !session?.user?.id || !conversation) return
    
    try {
      setSending(true)
      
      // 获取接收者ID（会话中的另一个用户）
      const receiverId = getOtherParticipant(conversation).id
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: params.id,
          content: messageInput,
          receiverId,
        }),
      })
      
      if (!response.ok) {
        throw new Error("发送消息失败")
      }
      
      // 发送Socket消息
      try {
        sendMessage({
          conversationId: params.id,
          content: messageInput,
          senderId: session.user.id,
          receiverId,
        });
      } catch (error) {
        console.error("Socket 消息发送失败:", error);
      }
      
      // 清空输入框
      setMessageInput("")
      
      // 刷新消息列表
      const data = await response.json()
      setMessages(prev => [...prev, data])
    } catch (error) {
      console.error("发送消息失败:", error)
    } finally {
      setSending(false)
    }
  }

  function getOtherParticipant(conversation: Conversation) {
    return conversation.participants.find(p => p.id !== session?.user?.id) || conversation.participants[0]
  }

  function formatMessageTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 获取用户首字母用于头像
  const getUserInitial = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // 显示加载状态
  if (status === "loading") {
    return <div className="container py-8 text-center">加载中...</div>;
  }

  // 如果未登录，不渲染任何内容（已在 useEffect 中处理重定向）
  if (status === "unauthenticated") {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        加载中...
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">会话不存在或已被删除</p>
          <Button asChild>
            <Link href="/messages">返回消息列表</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const otherUser = getOtherParticipant(conversation)

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        {/* 聊天头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push("/messages")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar 
                src={otherUser.image} 
                alt={otherUser.name || "用户"} 
                fallbackText={getUserInitial(otherUser.name)}
              />
              <div>
                <h2 className="font-medium">{otherUser.name}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* 商品信息（如果有） */}
        {conversation.product && (
          <Card className="p-4 mb-4">
            <Link href={`/products/${conversation.product.id}`} className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded overflow-hidden">
                <Image
                  src={conversation.product.images[0] || "/placeholder.jpg"}
                  alt={conversation.product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{conversation.product.title}</h3>
                <p className="text-primary font-bold">¥{conversation.product.price.toLocaleString()}</p>
              </div>
              <Button>立即购买</Button>
            </Link>
          </Card>
        )}

        {/* 聊天消息 */}
        <div className="bg-muted/30 rounded-lg p-4 h-[400px] overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              暂无消息，开始聊天吧
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = session?.user && message.sender.id === session.user.id
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <Avatar 
                        src={message.sender.image} 
                        alt={message.sender.name || "用户"} 
                        fallbackText={getUserInitial(message.sender.name)}
                        className="h-8 w-8"
                      />
                      <div>
                        <div 
                          className={`rounded-2xl px-4 py-2 ${
                            isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-2">
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 消息输入框 */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !messageInput.trim()}>
            {sending ? "发送中..." : "发送"}
          </Button>
        </form>
      </div>
    </div>
  )
} 
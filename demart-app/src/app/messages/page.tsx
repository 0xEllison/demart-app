"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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
  messages: {
    id: string
    content: string
    createdAt: string
    senderId: string
  }[]
  updatedAt: string
}

// 获取用户首字母用于头像
const getUserInitial = (name: string | null | undefined) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

export default function MessagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    // 只有当会话状态确定后才进行操作
    if (status === "loading") return;
    
    // 如果未登录，重定向到登录页面
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    // 已登录，获取会话列表
    if (status === "authenticated") {
      fetchConversations();
    }
  }, [status, router]);

  async function fetchConversations() {
    try {
      setLoading(true)
      const response = await fetch("/api/conversations")
      
      if (!response.ok) {
        throw new Error("获取会话列表失败")
      }
      
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("获取会话列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  function getOtherParticipant(conversation: Conversation) {
    return conversation.participants.find(p => p.id !== session?.user?.id) || conversation.participants[0]
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return days[date.getDay()]
    } else {
      return date.toLocaleDateString()
    }
  }

  // 显示加载状态
  if (status === "loading") {
    return <div className="container py-8 text-center">加载中...</div>;
  }

  // 如果未登录，不渲染任何内容（已在 useEffect 中处理重定向）
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">我的消息</h1>

      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : conversations.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">暂无消息</p>
          <Button asChild>
            <Link href="/products">浏览商品</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation)
            const lastMessage = conversation.messages[0]
            
            return (
              <Link 
                href={`/messages/${conversation.id}`} 
                key={conversation.id}
                className="block"
              >
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar 
                      src={otherUser.image} 
                      alt={otherUser.name || "用户"} 
                      fallbackText={getUserInitial(otherUser.name)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{otherUser.name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>
                      
                      {lastMessage && session?.user && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.senderId === session.user.id ? "我: " : ""}{lastMessage.content}
                        </p>
                      )}
                      
                      {conversation.product && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="relative w-8 h-8 rounded overflow-hidden">
                            <Image
                              src={conversation.product.images[0] || "/placeholder.jpg"}
                              alt={conversation.product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate">{conversation.product.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
} 
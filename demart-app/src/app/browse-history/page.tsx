"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { 
  getBrowseHistory, 
  clearBrowseHistory, 
  removeFromBrowseHistory, 
  BrowseHistoryItem,
  updateLastViewedTimestamp
} from "@/lib/browse-history"

export default function BrowseHistoryPage() {
  const [historyItems, setHistoryItems] = useState<BrowseHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 加载浏览历史
  useEffect(() => {
    // 更新最后查看时间戳
    updateLastViewedTimestamp()
    
    // 获取浏览历史
    const items = getBrowseHistory()
    setHistoryItems(items)
    setIsLoading(false)
  }, [])

  // 处理清空所有记录
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有浏览记录吗？')) {
      clearBrowseHistory()
      setHistoryItems([])
    }
  }

  // 处理删除单条记录
  const handleRemoveItem = (id: string) => {
    removeFromBrowseHistory(id)
    setHistoryItems(prev => prev.filter(item => item.id !== id))
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">浏览记录</h1>
        {historyItems.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearAll}
            className="text-destructive hover:text-destructive"
          >
            清空全部记录
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无浏览记录</p>
          <Button asChild className="mt-4">
            <Link href="/products">去浏览商品</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((item) => (
            <Card key={item.id + item.timestamp} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={item.imageUrl || "/placeholder.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">删除</span>
                  </Button>
                </div>
                <p className="text-primary font-bold mt-1">¥{item.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  浏览时间: {formatTime(item.timestamp)}
                </p>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href={`/products/${item.id}`}>查看详情</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Clock, ChevronRight } from "lucide-react"
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
    <div className="container py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">浏览记录</h1>
        {historyItems.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearAll}
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            清空全部
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">暂无浏览记录</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/products">去浏览商品</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {historyItems.map((item) => (
            <Link 
              href={`/products/${item.id}`} 
              key={item.id + item.timestamp}
              className="block"
            >
              <Card className="hover:bg-slate-50 transition-colors">
                <div className="flex items-center p-3">
                  <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={item.imageUrl || "/placeholder.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                      sizes="48px"
                />
              </div>
                  <div className="ml-3 flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate pr-2">{item.title}</h3>
                      <p className="text-primary font-medium text-sm whitespace-nowrap">{item.price.toLocaleString()} 元</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(item.timestamp)}
                      </div>
                  <Button
                    variant="ghost"
                    size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                  >
                        <Trash2 className="h-3 w-3" />
                    <span className="sr-only">删除</span>
                  </Button>
                </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 
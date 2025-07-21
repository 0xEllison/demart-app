"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2Icon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const [isClient, setIsClient] = useState(false)
  
  // 确保在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 如果还没有在客户端渲染，显示加载状态
  if (!isClient) {
    return (
      <div className="container py-8 text-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">购物车</h1>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <ShoppingCartIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">购物车是空的</h2>
            <p className="text-muted-foreground mb-4">
              您的购物车中还没有商品，去浏览商品吧！
            </p>
            <Button asChild>
              <Link href="/products">浏览商品</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 relative bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.id}`} className="font-medium hover:underline">
                        {item.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        卖家: {item.sellerName || "匿名卖家"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-semibold">
                          {item.price.toLocaleString()} {item.currency}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value)
                              if (!isNaN(value) && value >= 1) {
                                updateQuantity(item.id, value)
                              }
                            }}
                            className="w-16 h-8 text-center"
                            min={1}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearCart}>
                清空购物车
              </Button>
            </div>
          </div>
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">订单摘要</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>商品数量</span>
                  <span>{items.reduce((acc, item) => acc + item.quantity, 0)} 件</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>总计</span>
                  <span>{total.toLocaleString()} USDC</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push("/checkout")}>
                去结算
              </Button>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">继续购物</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 
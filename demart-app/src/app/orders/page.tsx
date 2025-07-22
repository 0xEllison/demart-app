"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
  product: {
    id: string
    title: string
    images: string[]
    seller: {
      id: string
      name: string
      image?: string
    }
  }
  buyer: {
    id: string
    name: string
    image?: string
  }
  seller: {
    id: string
    name: string
    image?: string
  }
  address: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    address: string
  }
}

const statusMap = {
  AWAITING_PAYMENT: { label: "待付款", color: "yellow" },
  PENDING_CONFIRMATION: { label: "确认中", color: "blue" },
  PAYMENT_CONFIRMED: { label: "待发货", color: "green" },
  SHIPPED: { label: "待收货", color: "blue" },
  COMPLETED: { label: "已完成", color: "green" },
  CANCELLED: { label: "已取消", color: "red" }
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchOrders()
  }, [session, activeTab])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (activeTab !== "all") {
        params.append("type", activeTab)
      }

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: "gray" }
    return (
      <Badge 
        variant={statusInfo.color === "red" ? "destructive" : 
                statusInfo.color === "green" ? "default" : "secondary"}
      >
        {statusInfo.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">我的订单</h1>
        
        {/* 标签页 */}
        <div className="flex space-x-1 border-b">
          {[
            { key: "all", label: "全部" },
            { key: "buy", label: "我的购买" },
            { key: "sell", label: "我的销售" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">暂无订单</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    {/* 商品图片 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {order.product.images[0] && (
                        <img
                          src={order.product.images[0]}
                          alt={order.product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* 订单信息 */}
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{order.product.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        订单号: {order.id}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.buyer.id === session?.user?.id ? "卖家" : "买家"}: {
                          order.buyer.id === session?.user?.id 
                            ? order.seller.name 
                            : order.buyer.name
                        }
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {order.totalAmount} {order.currency}
                      </p>
                    </div>
                  </div>

                  {/* 状态和操作 */}
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <div className="mt-3 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        查看详情
                      </Button>
                      {order.status === "AWAITING_PAYMENT" && order.buyer.id === session?.user?.id && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/orders/${order.id}/pay`)}
                        >
                          立即支付
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
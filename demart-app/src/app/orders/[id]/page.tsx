"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Order {
  id: string
  status: string
  price: number
  totalAmount: number
  currency: string
  quantity: number
  notes?: string
  txHash?: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    title: string
    description: string
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
  AWAITING_PAYMENT: { 
    label: "待付款", 
    color: "yellow",
    description: "请尽快完成付款"
  },
  PENDING_CONFIRMATION: { 
    label: "确认中", 
    color: "blue",
    description: "交易已提交，等待区块链确认"
  },
  PAYMENT_CONFIRMED: { 
    label: "待发货", 
    color: "green",
    description: "付款成功，等待卖家发货"
  },
  SHIPPED: { 
    label: "待收货", 
    color: "blue",
    description: "卖家已发货，请注意查收"
  },
  COMPLETED: { 
    label: "已完成", 
    color: "green",
    description: "交易已完成"
  },
  CANCELLED: { 
    label: "已取消", 
    color: "red",
    description: "订单已取消"
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    fetchOrder()
  }, [session, params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else if (response.status === 404) {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/orders/${params.id}/pay`, {
        method: "POST"
      })

      if (response.ok) {
        const result = await response.json()
        alert(`支付提交成功！\n交易哈希: ${result.txHash}\n预计确认时间: ${Math.round(result.estimatedConfirmationTime / 1000)}秒`)
        
        // 轮询订单状态更新
        const pollStatus = setInterval(async () => {
          await fetchOrder()
          if (order?.status === "PAYMENT_CONFIRMED") {
            clearInterval(pollStatus)
          }
        }, 2000)
        
        // 5分钟后停止轮询
        setTimeout(() => clearInterval(pollStatus), 5 * 60 * 1000)
      } else {
        const error = await response.text()
        alert(`支付失败: ${error}`)
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("支付失败")
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmReceived = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" })
      })

      if (response.ok) {
        await fetchOrder()
        alert("确认收货成功！")
      } else {
        alert("操作失败")
      }
    } catch (error) {
      console.error("Confirm error:", error)
      alert("操作失败")
    } finally {
      setProcessing(false)
    }
  }

  const handleShip = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SHIPPED" })
      })

      if (response.ok) {
        await fetchOrder()
        alert("发货成功！")
      } else {
        alert("操作失败")
      }
    } catch (error) {
      console.error("Ship error:", error)
      alert("操作失败")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <Card className="h-32" />
          <Card className="h-40" />
          <Card className="h-32" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">订单不存在</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = statusMap[order.status as keyof typeof statusMap]
  const isBuyer = order.buyer.id === session?.user?.id
  const isSeller = order.seller.id === session?.user?.id

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-4">
        <div className="flex items-center mb-3">
        <Button 
            variant="ghost" 
          onClick={() => router.push("/orders")}
            size="sm"
            className="mr-2 p-0 h-8 w-8"
        >
            ←
        </Button>
          <h1 className="text-xl font-medium">订单详情</h1>
          <Badge 
            variant={statusInfo?.color === "red" ? "destructive" : 
                    statusInfo?.color === "green" ? "default" : "secondary"}
            className="ml-3"
          >
            {statusInfo?.label || order.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">
          订单号: {order.id.substring(0, 8)}...{order.id.substring(order.id.length - 4)}
        </p>
      </div>

      {/* 订单状态 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4 text-3xl">
              {order.status === "AWAITING_PAYMENT" && "⏰"}
              {order.status === "PENDING_CONFIRMATION" && "🔄"}
              {order.status === "PAYMENT_CONFIRMED" && "📦"}
              {order.status === "SHIPPED" && "🚚"}
              {order.status === "COMPLETED" && "✅"}
              {order.status === "CANCELLED" && "❌"}
            </div>
            <div className="flex-grow">
              <div className="flex items-center">
                <h3 className="text-lg font-medium mr-2">{statusInfo?.label}</h3>
                <Badge 
                  variant={statusInfo?.color === "red" ? "destructive" : 
                          statusInfo?.color === "green" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {statusInfo?.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{statusInfo?.description}</p>
            </div>
          </div>
          
          {order.txHash && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs">
              <p className="text-gray-600 mb-1">交易哈希:</p>
              <p className="font-mono break-all">{order.txHash}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 商品信息 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {order.product.images[0] && (
                <img
                  src={order.product.images[0]}
                  alt={order.product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate">{order.product.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">{order.product.description}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-600">
                  <span>单价: {order.price} {order.currency}</span>
                  <span className="mx-2">·</span>
                  <span>数量: {order.quantity}</span>
                </div>
                <p className="text-sm font-bold text-blue-600">
                  总价: {order.totalAmount} {order.currency}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* 收货信息 */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">收货信息</h3>
            <div className="space-y-1 text-sm">
              <p className="flex">
                <span className="text-gray-500 w-16">收货人:</span> 
                <span>{order.address.name}</span>
              </p>
              <p className="flex">
                <span className="text-gray-500 w-16">电话:</span> 
                <span>{order.address.phone}</span>
              </p>
              <p className="flex items-start">
                <span className="text-gray-500 w-16">地址:</span> 
                <span className="flex-1">{order.address.province}{order.address.city}{order.address.district}{order.address.address}</span>
              </p>
          </div>
        </CardContent>
      </Card>

      {/* 交易信息 */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">交易信息</h3>
            <div className="space-y-1 text-sm">
              <p className="flex">
                <span className="text-gray-500 w-16">买家:</span> 
                <span>{order.buyer.name}</span>
              </p>
              <p className="flex">
                <span className="text-gray-500 w-16">卖家:</span> 
                <span>{order.seller.name}</span>
              </p>
              <p className="flex">
                <span className="text-gray-500 w-16">创建时间:</span> 
                <span>{new Date(order.createdAt).toLocaleString('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</span>
              </p>
          </div>
        </CardContent>
      </Card>
      </div>
      
      {/* 备注信息 */}
      {order.notes && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">买家备注</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {order.status === "AWAITING_PAYMENT" && isBuyer && (
                <p className="text-gray-600">请尽快完成支付以确保订单</p>
              )}
              {order.status === "PAYMENT_CONFIRMED" && isSeller && (
                <p className="text-gray-600">买家已完成支付，请尽快发货</p>
              )}
              {order.status === "SHIPPED" && isBuyer && (
                <p className="text-gray-600">卖家已发货，收到商品后请确认</p>
              )}
            </div>
            <div className="flex space-x-3">
        {order.status === "AWAITING_PAYMENT" && isBuyer && (
          <Button
            onClick={handlePayment}
            disabled={processing}
                  size="sm"
                  className="px-6"
          >
            {processing ? "处理中..." : "立即支付"}
          </Button>
        )}
        
        {order.status === "PAYMENT_CONFIRMED" && isSeller && (
          <Button
            onClick={handleShip}
            disabled={processing}
                  size="sm"
                  className="px-6"
          >
            {processing ? "处理中..." : "确认发货"}
          </Button>
        )}
        
        {order.status === "SHIPPED" && isBuyer && (
          <Button
            onClick={handleConfirmReceived}
            disabled={processing}
                  size="sm"
                  className="px-6"
          >
            {processing ? "处理中..." : "确认收货"}
          </Button>
        )}
      </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
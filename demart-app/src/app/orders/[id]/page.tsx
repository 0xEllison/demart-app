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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push("/orders")}
          className="mb-4"
        >
          ← 返回订单列表
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">订单详情</h1>
          <Badge 
            variant={statusInfo?.color === "red" ? "destructive" : 
                    statusInfo?.color === "green" ? "default" : "secondary"}
          >
            {statusInfo?.label || order.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          订单号: {order.id}
        </p>
      </div>

      {/* 订单状态 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>订单状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {order.status === "AWAITING_PAYMENT" && "⏰"}
              {order.status === "PENDING_CONFIRMATION" && "🔄"}
              {order.status === "PAYMENT_CONFIRMED" && "📦"}
              {order.status === "SHIPPED" && "🚚"}
              {order.status === "COMPLETED" && "✅"}
              {order.status === "CANCELLED" && "❌"}
            </div>
            <h3 className="text-xl font-bold mb-2">{statusInfo?.label}</h3>
            <p className="text-gray-600">{statusInfo?.description}</p>
            
            {order.txHash && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">交易哈希:</p>
                <p className="font-mono text-sm break-all">{order.txHash}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 商品信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>商品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
              {order.product.images[0] && (
                <img
                  src={order.product.images[0]}
                  alt={order.product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">{order.product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{order.product.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">单价: {order.price} {order.currency}</p>
                  <p className="text-sm text-gray-600">数量: {order.quantity}</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  总价: {order.totalAmount} {order.currency}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 收货信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>收货信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><span className="font-medium">收货人:</span> {order.address.name}</p>
            <p><span className="font-medium">电话:</span> {order.address.phone}</p>
            <p><span className="font-medium">地址:</span> {order.address.province}{order.address.city}{order.address.district}{order.address.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* 交易信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>交易信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><span className="font-medium">买家:</span> {order.buyer.name}</p>
            <p><span className="font-medium">卖家:</span> {order.seller.name}</p>
            <p><span className="font-medium">创建时间:</span> {new Date(order.createdAt).toLocaleString()}</p>
            <p><span className="font-medium">更新时间:</span> {new Date(order.updatedAt).toLocaleString()}</p>
            {order.notes && (
              <div>
                <p className="font-medium">买家备注:</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{order.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4">
        {order.status === "AWAITING_PAYMENT" && isBuyer && (
          <Button
            onClick={handlePayment}
            disabled={processing}
            size="lg"
          >
            {processing ? "处理中..." : "立即支付"}
          </Button>
        )}
        
        {order.status === "PAYMENT_CONFIRMED" && isSeller && (
          <Button
            onClick={handleShip}
            disabled={processing}
            size="lg"
          >
            {processing ? "处理中..." : "确认发货"}
          </Button>
        )}
        
        {order.status === "SHIPPED" && isBuyer && (
          <Button
            onClick={handleConfirmReceived}
            disabled={processing}
            size="lg"
          >
            {processing ? "处理中..." : "确认收货"}
          </Button>
        )}
      </div>
    </div>
  )
}
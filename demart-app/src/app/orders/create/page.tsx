"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AddressDialog } from "@/components/address/address-dialog"

interface Product {
  id: string
  title: string
  price: number
  currency: string
  images: string[]
  seller: {
    id: string
    name: string
    image?: string
  }
}

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

export default function CreateOrderPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")

  const [product, setProduct] = useState<Product | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!productId) {
      router.push("/")
      return
    }

    Promise.all([
      fetchProduct(),
      fetchAddresses()
    ]).finally(() => setLoading(false))
  }, [session, productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        throw new Error("Product not found")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      router.push("/")
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/address")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        
        // 自动选择默认地址
        const defaultAddress = data.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    }
  }

  const handleAddressSubmit = async (addressData: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    address: string
    isDefault: boolean
  }) => {
    try {
      const response = await fetch("/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData)
      })

      if (response.ok) {
        const newAddress = await response.json()
        // 重新获取地址列表
        await fetchAddresses()
        // 如果新地址是默认地址，或者当前没有选中地址，则选中新地址
        if (newAddress.isDefault || !selectedAddressId) {
          setSelectedAddressId(newAddress.id)
        }
      } else {
        const error = await response.text()
        throw new Error(error || "添加地址失败")
      }
    } catch (error) {
      console.error("Error adding address:", error)
      throw error // 重新抛出错误，让对话框显示错误信息
    }
  }

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      alert("请选择收货地址")
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          addressId: selectedAddressId,
          quantity,
          notes: notes.trim() || undefined
        })
      })

      if (response.ok) {
        const order = await response.json()
        router.push(`/orders/${order.id}`)
      } else {
        const error = await response.text()
        alert(`创建订单失败: ${error}`)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("创建订单失败")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <Card className="h-40" />
          <Card className="h-32" />
          <Card className="h-24" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">商品不存在</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
  const totalAmount = product.price * quantity

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          ← 返回
        </Button>
        <h1 className="text-3xl font-bold">确认订单</h1>
      </div>

      {/* 商品信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>商品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                卖家: {product.seller.name}
              </p>
              <p className="text-lg font-bold text-blue-600">
                {product.price} {product.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 收货地址 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            收货地址
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddressDialog(true)}
            >
              添加新地址
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">暂无收货地址</p>
              <Button onClick={() => setShowAddressDialog(true)}>
                添加地址
              </Button>
            </div>
          ) : (
            <>
              <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择收货地址" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((address) => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.name} {address.phone} - {address.province}{address.city}{address.district}{address.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedAddress && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedAddress.name} {selectedAddress.phone}</p>
                  <p className="text-gray-600">
                    {selectedAddress.province}{selectedAddress.city}{selectedAddress.district}{selectedAddress.address}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 订单备注 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>订单备注</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="给卖家留言..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* 支付信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>支付信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>商品金额</span>
              <span>{product.price} {product.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>数量</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>平台费用</span>
              <span>0 {product.currency}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>总计</span>
              <span className="text-blue-600">{totalAmount} {product.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 创建订单按钮 */}
      <Button
        onClick={handleCreateOrder}
        disabled={creating || !selectedAddressId}
        className="w-full"
        size="lg"
      >
        {creating ? "创建中..." : "确认下单"}
      </Button>

      {/* 地址对话框 */}
      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onSubmit={handleAddressSubmit}
      />
    </div>
  )
}
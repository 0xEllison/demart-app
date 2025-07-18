"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { AddressDialog } from "@/components/address/address-dialog"

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

export default function AddressPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    // 只有当会话状态确定后才进行操作
    if (status === "loading") return;
    
    // 如果未登录，重定向到登录页面
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    // 已登录，获取地址列表
    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router]);

  // 显示加载状态
  if (status === "loading") {
    return <div className="p-8 text-center">加载中...</div>;
  }

  // 如果未登录，不渲染任何内容（已在 useEffect 中处理重定向）
  if (status === "unauthenticated") {
    return null;
  }

  async function fetchAddresses() {
    try {
      setLoading(true)
      const response = await fetch("/api/user/address")
      
      if (!response.ok) {
        throw new Error("获取地址列表失败")
      }
      
      const data = await response.json()
      setAddresses(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "获取地址列表失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAddress(data: any) {
    try {
      const response = await fetch("/api/user/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("添加地址失败")
      }

      setSuccess("地址添加成功")
      fetchAddresses()
    } catch (error) {
      setError(error instanceof Error ? error.message : "添加地址失败，请稍后重试")
      throw error
    }
  }

  async function handleEditAddress(data: any) {
    if (!editingAddress) return

    try {
      const response = await fetch("/api/user/address", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingAddress.id,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error("更新地址失败")
      }

      setSuccess("地址更新成功")
      fetchAddresses()
    } catch (error) {
      setError(error instanceof Error ? error.message : "更新地址失败，请稍后重试")
      throw error
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/address?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("删除地址失败")
      }

      setSuccess("地址删除成功")
      fetchAddresses()
    } catch (error) {
      setError(error instanceof Error ? error.message : "删除地址失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(address: Address) {
    setEditingAddress(address)
    setShowAddressDialog(true)
  }

  function handleDialogClose() {
    setShowAddressDialog(false)
    setEditingAddress(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">地址管理</h3>
        <p className="text-sm text-muted-foreground">
          管理您的收货地址
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddressDialog(true)}
            disabled={loading}
          >
            + 添加新地址
          </Button>

          <div className="space-y-4">
            {loading && <div className="text-center py-4">加载中...</div>}
            
            {!loading && addresses.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                暂无收货地址
              </div>
            )}

            {!loading && addresses.map((address) => (
              <div 
                key={address.id} 
                className={`border rounded-md p-4 relative ${address.isDefault ? 'border-primary' : 'border-border'}`}
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                    默认
                  </span>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{address.name} <span className="text-muted-foreground">{address.phone}</span></div>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {address.province} {address.city} {address.district} {address.address}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(address)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={loading}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {error && <FormError message={error} />}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-md flex items-center gap-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <p>{success}</p>
            </div>
          )}
        </div>
      </Card>

      <AddressDialog
        open={showAddressDialog}
        onOpenChange={handleDialogClose}
        onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
        initialData={editingAddress}
      />
    </div>
  )
} 
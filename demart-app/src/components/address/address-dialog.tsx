"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormError } from "@/components/ui/form-error"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddressFormData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddressFormData) => Promise<void>
  initialData?: AddressFormData | null
}

export function AddressDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddressDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const isEditing = !!initialData

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const data: AddressFormData = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        province: formData.get("province") as string,
        city: formData.get("city") as string,
        district: formData.get("district") as string,
        address: formData.get("address") as string,
        isDefault: formData.get("isDefault") === "on",
      }

      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑地址" : "添加新地址"}</DialogTitle>
          <DialogDescription>
            请填写收货地址信息，带 * 的为必填项
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  收货人姓名 *
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="请输入姓名"
                  defaultValue={initialData?.name || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none">
                  手机号码 *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="请输入手机号"
                  defaultValue={initialData?.phone || ""}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="province" className="text-sm font-medium leading-none">
                  省份 *
                </label>
                <Input
                  id="province"
                  name="province"
                  placeholder="省份"
                  defaultValue={initialData?.province || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium leading-none">
                  城市 *
                </label>
                <Input
                  id="city"
                  name="city"
                  placeholder="城市"
                  defaultValue={initialData?.city || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="district" className="text-sm font-medium leading-none">
                  区县 *
                </label>
                <Input
                  id="district"
                  name="district"
                  placeholder="区县"
                  defaultValue={initialData?.district || ""}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium leading-none">
                详细地址 *
              </label>
              <Input
                id="address"
                name="address"
                placeholder="街道、门牌号等"
                defaultValue={initialData?.address || ""}
                disabled={loading}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                defaultChecked={initialData?.isDefault || false}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none"
              >
                设为默认地址
              </label>
            </div>
            {error && <FormError message={error} />}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
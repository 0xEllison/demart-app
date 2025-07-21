"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/ui/form-error"
import { ImageUpload } from "@/components/ui/image-upload"

const PRODUCT_CONDITIONS = [
  { value: "全新", label: "全新" },
  { value: "几乎全新", label: "几乎全新" },
  { value: "二手良好", label: "二手良好" },
  { value: "二手一般", label: "二手一般" },
]

const PRODUCT_CATEGORIES = [
  { value: "电子产品", label: "电子产品" },
  { value: "服装", label: "服装" },
  { value: "家居", label: "家居" },
  { value: "玩具", label: "玩具" },
  { value: "书籍", label: "书籍" },
  { value: "其他", label: "其他" },
]

export default function CreateProductPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // 只有当会话状态确定后才进行操作
    if (status === "loading") return;
    
    // 如果未登录，重定向到登录页面
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 显示加载状态
  if (status === "loading") {
    return <div className="container py-8 text-center">加载中...</div>;
  }

  // 如果未登录，不渲染任何内容（已在 useEffect 中处理重定向）
  if (status === "unauthenticated") {
    return null;
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const productData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        condition: formData.get("condition") as string,
        category: formData.get("category") as string,
        tags,
        images: images.length > 0 ? images : ["/placeholder.jpg"], // 使用上传的图片或默认占位图
      }

      // 验证必填字段
      if (!productData.title.trim()) {
        throw new Error("请输入商品标题");
      }
      if (!productData.description.trim()) {
        throw new Error("请输入商品描述");
      }
      if (isNaN(productData.price) || productData.price <= 0) {
        throw new Error("请输入有效的价格");
      }
      if (!productData.condition) {
        throw new Error("请选择商品状态");
      }
      if (!productData.category) {
        throw new Error("请选择商品分类");
      }

      // 调用API创建商品
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "发布失败，请稍后重试");
      }

      const data = await response.json();
      setSuccess("商品发布成功！");
      
      // 成功后跳转到商品详情页
      router.push(`/products/${data.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "发布失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">发布商品</h1>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none">
                商品标题 *
              </label>
              <Input
                id="title"
                name="title"
                placeholder="请输入商品标题"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">
                商品描述 *
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="请详细描述商品的情况、特点等"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium leading-none">
                  价格 (¥) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="condition" className="text-sm font-medium leading-none">
                  商品状态 *
                </label>
                <select
                  id="condition"
                  name="condition"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={loading}
                >
                  <option value="">请选择</option>
                  {PRODUCT_CONDITIONS.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium leading-none">
                分类 *
              </label>
              <select
                id="category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
              >
                <option value="">请选择</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium leading-none">
                标签
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <div key={tag} className="bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="输入标签后按回车添加"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                添加标签有助于买家更容易找到您的商品
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                商品图片
              </label>
              <ImageUpload 
                value={images}
                onChange={setImages}
                disabled={loading}
                maxImages={5}
              />
              <p className="text-xs text-muted-foreground">
                上传清晰的商品照片可以提高成交率
              </p>
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "发布中..." : "发布商品"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
} 
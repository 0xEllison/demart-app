import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/products/product-card"

// 模拟商品数据
const mockProducts = [
  {
    id: "1",
    title: "MacBook Air M3",
    description: "全新的MacBook Air M3，8核CPU，10核GPU，16GB内存，512GB SSD",
    price: 9999,
    condition: "全新",
    images: ["/images/m3-macbook-air-overhead-2.webp"],
    category: "电子产品",
    tags: ["苹果", "笔记本", "电脑"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Minecraft 钻石剑",
    description: "Minecraft 钻石剑玩具，1:1还原游戏中的道具",
    price: 199,
    condition: "二手",
    images: ["/images/minecraft-diamond-sword.jpeg"],
    category: "玩具",
    tags: ["游戏", "Minecraft", "收藏品"],
    createdAt: new Date().toISOString(),
  },
]

export default function ProductsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">浏览商品</h1>
        <Button asChild>
          <Link href="/products/create">发布商品</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {mockProducts.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">暂无商品</p>
          <Button asChild>
            <Link href="/products/create">发布第一个商品</Link>
          </Button>
        </Card>
      )}
    </div>
  )
} 
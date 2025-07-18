import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Layers, Clock, TrendingDown, TrendingUp, Laptop, Gamepad2, Palette } from "lucide-react"

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: "MacBook Pro M3 14寸 (2024)",
    price: "1500.00",
    currency: "USDC",
    image: "/images/m3-macbook-air-overhead-2.webp",
    seller: {
      name: "alex.eth",
      avatar: "/images/avatar-2.png",
      rating: 4.8
    }
  },
  {
    id: 2,
    title: "Minecraft钻石剑（附魔）",
    price: "50.00",
    currency: "USDT",
    image: "/images/minecraft-diamond-sword.jpeg",
    seller: {
      name: "bella_crypto",
      avatar: "/images/avatar-3.png",
      rating: 4.5
    }
  },
  {
    id: 3,
    title: "Logo设计服务（3天交付）",
    price: "200.00",
    currency: "USDC",
    image: "/images/logo-design-service.jpg",
    seller: {
      name: "design_master",
      avatar: "/images/avatar-1.png",
      rating: 4.9
    }
  }
]

export default function Home() {
  return (
    <div className="container py-8">
      {/* 筛选器 */}
      <div className="flex gap-4 mb-8">
        <Select>
          <SelectTrigger className="w-[160px] bg-white">
            <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="全球" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>全球</span>
              </div>
            </SelectItem>
            <SelectItem value="asia">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>亚洲</span>
              </div>
            </SelectItem>
            <SelectItem value="europe">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>欧洲</span>
          </div>
            </SelectItem>
            <SelectItem value="north-america">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>北美洲</span>
        </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px] bg-white">
            <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="所有分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center">
                <Layers className="mr-2 h-4 w-4" />
                <span>所有分类</span>
              </div>
            </SelectItem>
            <SelectItem value="electronics">
              <div className="flex items-center">
                <Laptop className="mr-2 h-4 w-4" />
                <span>电子产品</span>
              </div>
            </SelectItem>
            <SelectItem value="virtual">
              <div className="flex items-center">
                <Gamepad2 className="mr-2 h-4 w-4" />
                <span>虚拟物品</span>
            </div>
            </SelectItem>
            <SelectItem value="services">
              <div className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                <span>设计服务</span>
        </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px] bg-white">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="最新发布" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>最新发布</span>
              </div>
            </SelectItem>
            <SelectItem value="price-asc">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>价格从低到高</span>
              </div>
            </SelectItem>
            <SelectItem value="price-desc">
              <div className="flex items-center">
                <TrendingDown className="mr-2 h-4 w-4" />
                <span>价格从高到低</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
            </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {SAMPLE_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
          ))}
        </div>

      {/* 加载更多 */}
      <div className="text-center mt-8">
        <Button variant="outline" size="sm">加载更多...</Button>
      </div>
    </div>
  )
}

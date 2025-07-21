"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// 商品类型定义
interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  seller: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // 获取商品数据
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products?sortBy=${sortBy}`);

        if (!response.ok) {
          throw new Error("获取商品信息失败");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("获取商品列表失败:", error);
        setError("获取商品信息失败，请刷新页面重试");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [sortBy]);

  // 根据搜索词和排序筛选商品
  useEffect(() => {
    if (!products) return;

    // 筛选商品
    let filtered = [...products];
    
    // 应用搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  // 处理排序变化
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">浏览商品</h1>
        <Button asChild>
          <Link href="/products/create">发布商品</Link>
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="搜索商品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新发布</SelectItem>
              <SelectItem value="price-asc">价格从低到高</SelectItem>
              <SelectItem value="price-desc">价格从高到低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-center text-red-500 my-8">{error}</div>
      )}

      {/* 加载中提示 */}
      {loading && (
        <div className="text-center my-8">加载中...</div>
      )}

      {/* 搜索结果提示 */}
      {!loading && searchQuery && (
        <p className="mb-4 text-sm text-muted-foreground">
          找到 {filteredProducts.length} 个与 "{searchQuery}" 相关的商品
        </p>
      )}

      {/* 商品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(searchQuery ? filteredProducts : products).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 没有商品提示 */}
      {!loading && products.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">暂无商品</p>
          <Button asChild>
            <Link href="/products/create">发布第一个商品</Link>
          </Button>
        </Card>
      )}

      {/* 搜索无结果提示 */}
      {!loading && products.length > 0 && filteredProducts.length === 0 && searchQuery && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">没有找到与 "{searchQuery}" 相关的商品</p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            清除搜索
          </Button>
        </Card>
      )}
    </div>
  )
} 
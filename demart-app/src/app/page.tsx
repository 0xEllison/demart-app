"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Layers, Clock, TrendingDown, TrendingUp, Laptop, Gamepad2, Palette } from "lucide-react"

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10;

  // 获取商品数据
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/products?limit=${limit}`;

        if (category) {
          url += `&category=${encodeURIComponent(category)}`;
        }

        if (sortBy) {
          url += `&sortBy=${encodeURIComponent(sortBy)}`;
        }

        if (currentPage > 1) {
          const offset = (currentPage - 1) * limit;
          url += `&offset=${offset}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("获取商品信息失败");
        }

        const data = await response.json();

        if (currentPage === 1) {
          // 第一页数据直接替换
          setProducts(data.products);
        } else {
          // 加载更多数据时追加
          setProducts(prev => [...prev, ...data.products]);
        }

        // 判断是否还有更多数据
        setHasMore(data.products.length === limit);
      } catch (error) {
        console.error("获取商品列表失败:", error);
        setError("获取商品信息失败，请刷新页面重试");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, sortBy, currentPage, limit]);

  // 处理分类变化
  const handleCategoryChange = (value: string) => {
    setCategory(value === "all" ? null : value);
    setCurrentPage(1);
  };

  // 处理排序变化
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // 加载更多
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="container py-8">
      {/* 筛选器 */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Select>
          <SelectTrigger className="w-[160px] bg-white">
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

        <Select onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[160px] bg-white">
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

        <Select onValueChange={handleSortChange} defaultValue="newest">
          <SelectTrigger className="w-[160px] bg-white">
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

      {/* 错误提示 */}
      {error && (
        <div className="text-center text-red-500 my-8">{error}</div>
      )}

      {/* 加载中提示 */}
      {loading && currentPage === 1 && (
        <div className="text-center my-8">加载中...</div>
      )}

      {/* 商品网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 没有商品提示 */}
      {!loading && products.length === 0 && (
        <div className="text-center my-8">暂无商品</div>
      )}

      {/* 加载更多 */}
      {!loading && products.length > 0 && hasMore && (
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading && currentPage > 1 ? "加载中..." : "加载更多..."}
          </Button>
        </div>
      )}
    </div>
  )
}

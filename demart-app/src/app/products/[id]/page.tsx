"use client"

import Image from "next/image"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { addToBrowseHistory } from "@/lib/browse-history"
import { useSession } from "next-auth/react"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { useCart } from "@/lib/cart-context"
import { ShoppingCartIcon } from "lucide-react"

// 获取用户首字母用于头像
const getUserInitial = (name: string | null) => {
  return name ? name.charAt(0).toUpperCase() : "U";
};

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  location: string | null;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()
  
  // 获取商品数据
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error("获取商品信息失败")
        }
        
        const data = await response.json()
        console.log("获取到的商品数据:", data) // 调试日志
        setProduct(data)
        
        // 将商品添加到浏览历史
        addToBrowseHistory({
          id: data.id,
          title: data.title,
          imageUrl: data.images[0] || "/placeholder.jpg",
          price: data.price,
        });
      } catch (error) {
        console.error("获取商品信息失败:", error)
        setError("获取商品信息失败，请刷新页面重试")
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [params.id])

  // 处理"聊一聊"按钮点击
  const handleChatClick = async () => {
    // 如果用户未登录，跳转到登录页面
    if (status !== "authenticated" || !session?.user) {
      router.push(`/login?redirect=/products/${params.id}`);
      return;
    }
    
    // 检查商品是否存在
    if (!product) {
      alert("商品信息不存在，无法发起聊天");
      return;
    }
    
    // 检查是否与自己聊天
    if (session.user.id === product.seller.id) {
      alert("不能与自己聊天");
      return;
    }
    
    try {
      setIsCreatingChat(true);
      console.log("创建会话参数:", {
        userId: product.seller.id,
        productId: product.id,
      }); // 调试日志
      
      // 创建会话
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: product.seller.id,
          productId: product.id, // 确保使用正确的商品ID
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("服务器返回错误:", errorData);
        throw new Error(errorData.error || "创建会话失败");
      }
      
      const data = await response.json();
      console.log("创建会话成功，返回数据:", data); // 调试日志
      
      // 确保返回了会话ID
      if (!data.id) {
        throw new Error("服务器返回的数据中没有会话ID");
      }
      
      // 跳转到聊天界面
      console.log("准备跳转到:", `/messages/${data.id}`); // 调试日志
      
      // 使用window.location.href进行硬跳转，避免Next.js路由问题
      window.location.href = `/messages/${data.id}`;
    } catch (error) {
      console.error("创建会话失败:", error);
      alert("创建会话失败，请稍后再试");
    } finally {
      setIsCreatingChat(false);
    }
  };

  // 处理添加到购物车
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      imageUrl: product.images[0] || "/placeholder.jpg",
      sellerId: product.seller.id,
      sellerName: product.seller.name,
    });
    
    setAddedToCart(true);
    
    // 3秒后重置状态
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>加载中...</p>
      </div>
    );
  }

  // 显示错误信息
  if (error || !product) {
    return (
      <div className="container py-8 text-center">
        <p className="text-red-500">{error || "商品不存在"}</p>
      </div>
    );
  }

  const { title, description, price, images, location, seller } = product;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品图片 */}
        <div>
          <ImageCarousel images={images} alt={title} />
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="mt-2 text-3xl font-bold text-primary">¥{price.toLocaleString()}</div>
            {location && (
              <div className="mt-1 inline-block bg-muted px-2 py-1 rounded text-sm">
                {location}
              </div>
            )}
          </div>

          {/* 卖家信息 */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar 
                src={seller.image || ""} 
                alt={seller.name || "卖家"} 
                fallbackText={getUserInitial(seller.name)}
              />
              <div>
                <p className="font-medium">{seller.name || "卖家"}</p>
                <p className="text-sm text-muted-foreground">卖家</p>
              </div>
            </div>
          </Card>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <Button 
              className="flex-1" 
              onClick={handleChatClick}
              disabled={isCreatingChat}
            >
              {isCreatingChat ? "创建会话中..." : "聊一聊"}
            </Button>
            <Button 
              variant={addedToCart ? "outline" : "default"}
              className="flex-1 flex items-center justify-center gap-2" 
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {addedToCart ? "已加入购物车" : "加入购物车"}
            </Button>
          </div>

          {/* 商品描述 */}
          <div>
            <h2 className="text-xl font-semibold mb-2">商品描述</h2>
            <div className="text-muted-foreground whitespace-pre-line">
              {description}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
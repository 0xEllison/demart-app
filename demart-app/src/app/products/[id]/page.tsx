"use client"

import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { useEffect } from "react"
import { addToBrowseHistory } from "@/lib/browse-history"

// 获取用户首字母用于头像
const getUserInitial = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : "U";
};

// 模拟商品数据
const mockProducts = [
  {
    id: "1",
    title: "MacBook Air M3",
    description: "全新的MacBook Air M3，8核CPU，10核GPU，16GB内存，512GB SSD。\n\n这款MacBook Air配备了Apple最新的M3芯片，性能强大，续航出色，是学习、工作和娱乐的理想选择。\n\n产品特点：\n- M3芯片，8核CPU，10核GPU\n- 16GB统一内存\n- 512GB SSD存储\n- 13.6英寸Liquid视网膜显示屏\n- 两个雷电接口\n- MagSafe 3充电接口\n- 1080p FaceTime HD相机\n- 背光妙控键盘\n- 触控ID\n- 力度触控板",
    price: 9999,
    condition: "全新",
    images: ["/images/m3-macbook-air-overhead-2.webp"],
    category: "电子产品",
    tags: ["苹果", "笔记本", "电脑"],
    createdAt: new Date().toISOString(),
    user: {
      id: "user1",
      name: "张三",
      image: "/images/avatar-1.png",
    }
  },
  {
    id: "2",
    title: "Minecraft 钻石剑",
    description: "Minecraft 钻石剑玩具，1:1还原游戏中的道具，适合收藏或Cosplay使用。\n\n材质：优质塑料\n尺寸：60cm长\n重量：约500g\n\n由于是二手物品，有轻微使用痕迹，但整体状况良好。",
    price: 199,
    condition: "二手",
    images: ["/images/minecraft-diamond-sword.jpeg"],
    category: "玩具",
    tags: ["游戏", "Minecraft", "收藏品"],
    createdAt: new Date().toISOString(),
    user: {
      id: "user2",
      name: "李四",
      image: "/images/avatar-2.png",
    }
  },
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id)

  if (!product) {
    notFound()
  }

  const { id, title, description, price, condition, images, category, tags, user } = product
  
  // 将商品添加到浏览历史
  useEffect(() => {
    addToBrowseHistory({
      id,
      title,
      imageUrl: images[0] || "/placeholder.jpg",
      price,
    });
  }, [id, title, images, price]);

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品图片 */}
        <div className="relative aspect-square">
          <Image
            src={images[0] || "/placeholder.jpg"}
            alt={title}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="mt-2 text-3xl font-bold text-primary">¥{price.toLocaleString()}</div>
            <div className="mt-1 inline-block bg-muted px-2 py-1 rounded text-sm">
              {condition}
            </div>
          </div>

          {/* 卖家信息 */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar 
                src={user.image} 
                alt={user.name} 
                fallbackText={getUserInitial(user.name)}
              />
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">卖家</p>
              </div>
            </div>
          </Card>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <Button className="flex-1">聊一聊</Button>
            <Button variant="outline" className="flex-1">我想要</Button>
          </div>

          {/* 商品描述 */}
          <div>
            <h2 className="text-xl font-semibold mb-2">商品描述</h2>
            <div className="text-muted-foreground whitespace-pre-line">
              {description}
            </div>
          </div>

          {/* 分类和标签 */}
          <div className="space-y-2">
            <div>
              <span className="font-medium">分类：</span>
              <span className="text-muted-foreground">{category}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="font-medium">标签：</span>
              {tags.map(tag => (
                <span key={tag} className="bg-muted px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AvatarDemoPage() {
  const [showImage, setShowImage] = useState(true)
  
  // 示例用户
  const users = [
    { name: "张三", image: "/images/avatar-1.png" },
    { name: "李四", image: "/images/avatar-2.png" },
    { name: "王五", image: "/images/avatar-3.png" },
    { name: "赵六", image: null },
    { name: "钱七", image: null },
    { name: "孙八", image: null },
    { name: "周九", image: null },
    { name: "吴十", image: null },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">头像组件演示</h1>
      
      <div className="mb-6">
        <Button 
          onClick={() => setShowImage(!showImage)} 
          variant="outline"
          className="mb-4"
        >
          {showImage ? "隐藏头像图片" : "显示头像图片"}
        </Button>
        <p className="text-sm text-muted-foreground mb-4">
          {showImage 
            ? "当前显示用户上传的头像图片（如果有）" 
            : "当前显示首字母占位头像（类似 GitHub 的默认头像）"}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {users.map((user) => (
          <div key={user.name} className="flex flex-col items-center gap-2">
            <Avatar
              src={showImage ? user.image || undefined : undefined}
              alt={user.name}
              className="h-24 w-24"
            />
            <span className="font-medium">{user.name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">不同尺寸的头像</h2>
        <div className="flex items-center gap-4">
          <Avatar alt="小尺寸" className="h-8 w-8" />
          <Avatar alt="中尺寸" className="h-12 w-12" />
          <Avatar alt="大尺寸" className="h-16 w-16" />
          <Avatar alt="超大尺寸" className="h-24 w-24" />
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">相同名字的头像颜色一致</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center">
            <Avatar alt="张三" className="h-16 w-16" />
            <span className="mt-2 text-sm">张三 1</span>
          </div>
          <div className="flex flex-col items-center">
            <Avatar alt="张三" className="h-16 w-16" />
            <span className="mt-2 text-sm">张三 2</span>
          </div>
          <div className="flex flex-col items-center">
            <Avatar alt="李四" className="h-16 w-16" />
            <span className="mt-2 text-sm">李四 1</span>
          </div>
          <div className="flex flex-col items-center">
            <Avatar alt="李四" className="h-16 w-16" />
            <span className="mt-2 text-sm">李四 2</span>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">自定义显示文本</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center">
            <Avatar alt="张三" fallbackText="张" className="h-16 w-16" />
            <span className="mt-2 text-sm">显示"张"</span>
          </div>
          <div className="flex flex-col items-center">
            <Avatar alt="李四" fallbackText="李四" className="h-16 w-16" />
            <span className="mt-2 text-sm">显示"李四"</span>
          </div>
          <div className="flex flex-col items-center">
            <Avatar alt="王五" fallbackText="W5" className="h-16 w-16" />
            <span className="mt-2 text-sm">显示"W5"</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
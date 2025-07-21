"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Upload, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  maxImages?: number
}

export function ImageUpload({
  value = [],
  onChange,
  disabled = false,
  maxImages = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isUploading) return
    
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // 检查是否超过最大图片数量
    if (value.length + files.length > maxImages) {
      alert(`最多只能上传 ${maxImages} 张图片`)
      return
    }
    
    setIsUploading(true)
    
    try {
      const newImages: string[] = []
      
      // 处理每个文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          continue
        }
        
        // 将文件转换为 base64 字符串用于预览
        // 注意：实际生产环境应该上传到服务器或云存储
        const base64 = await convertFileToBase64(file)
        newImages.push(base64)
      }
      
      // 更新图片列表
      onChange([...value, ...newImages])
    } catch (error) {
      console.error("图片上传失败:", error)
    } finally {
      setIsUploading(false)
      // 重置文件输入，允许再次选择相同的文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }
  
  const handleRemove = (index: number) => {
    if (disabled) return
    
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }
  
  // 将文件转换为 base64 字符串
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* 已上传的图片 */}
        {value.map((image, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-md overflow-hidden border border-border bg-muted"
          >
            <Image
              src={image}
              alt={`上传的图片 ${index + 1}`}
              fill
              className="object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-background/80 p-1 rounded-full hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        
        {/* 上传按钮 */}
        {value.length < maxImages && !disabled && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading || disabled}
            className="aspect-square rounded-md border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 hover:border-muted-foreground transition-colors"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {isUploading ? "上传中..." : "上传图片"}
            </span>
          </button>
        )}
      </div>
      
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={isUploading || disabled || value.length >= maxImages}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        {value.length} / {maxImages} 张图片 • 支持 JPG, PNG, WEBP 格式
      </p>
    </div>
  )
} 
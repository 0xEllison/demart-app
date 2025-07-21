"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // 如果没有图片，显示占位图
  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"]
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    )
  }
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    )
  }
  
  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }
  
  return (
    <div className="relative">
      {/* 主图 */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={displayImages[currentIndex]}
          alt={`${alt} - 图片 ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {/* 左右导航按钮 */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background"
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background"
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      
      {/* 缩略图导航 */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2",
                currentIndex === index ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={image}
                alt={`${alt} - 缩略图 ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 
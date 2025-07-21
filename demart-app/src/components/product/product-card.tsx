'use client'

import Image from "next/image"
import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"

interface ProductCardProps {
  product: {
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
}

export function ProductCard({ product }: ProductCardProps) {
  // 获取显示用的图片URL
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : "/placeholder.jpg";

  // 商品价格格式化
  const formattedPrice = product.price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // 卖家名称，如果为null则显示默认文本
  const sellerName = product.seller?.name || "匿名卖家";

  // 获取卖家名称的首字母，用于头像的fallback
  const sellerInitial = sellerName ? sellerName.charAt(0).toUpperCase() : "?";

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
        <div className="aspect-square relative bg-slate-50">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
              imgElement.parentElement?.classList.add('bg-slate-100');
            }}
          />
        </div>
        <div className="p-3 flex flex-col flex-1">
          <div className="flex-1">
            {/* 固定高度为两行，使用 line-clamp-2 和 min-h-[2.5rem] 确保一致的高度 */}
            <h3 
              className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem] leading-tight" 
              title={product.title}
            >
              {product.title}
            </h3>
            {/* 使用 tabular-nums 确保数字等宽对齐 */}
            <p className="text-primary font-bold text-base tabular-nums">
              {formattedPrice} {product.currency}
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100">
            <Avatar 
              src={product.seller?.image || ""} 
              alt={sellerName}
              className="w-5 h-5"
              fallbackText={sellerInitial}
            />
            <span className="text-xs text-muted-foreground flex-1 truncate">
              @{sellerName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
} 
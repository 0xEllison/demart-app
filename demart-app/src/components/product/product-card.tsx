'use client'

import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: {
    id: number
    title: string
    price: string
    currency: string
    image: string
    seller: {
      name: string
      avatar: string
      rating: number
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
        <div className="aspect-square relative bg-slate-50">
          <Image
            src={product.image}
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
              {parseFloat(product.price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} {product.currency}
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100">
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-slate-50">
              <Image
                src={product.seller.avatar}
                alt={product.seller.name}
                fill
                className="object-cover"
                sizes="20px"
              />
            </div>
            <span className="text-xs text-muted-foreground flex-1 truncate">
              @{product.seller.name}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              ⭐ {product.seller.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
} 
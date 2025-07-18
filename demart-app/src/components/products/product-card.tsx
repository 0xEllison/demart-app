import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  images: string[]
  category: string
  tags: string[]
  createdAt: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, title, price, images, condition } = product
  const imageUrl = images[0] || "/placeholder.jpg"

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${id}`}>
        <div className="aspect-square relative">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {condition}
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${id}`} className="no-underline">
          <h3 className="font-medium text-lg truncate">{title}</h3>
        </Link>
        <div className="mt-1 text-lg font-bold">¥{price.toLocaleString()}</div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/products/${id}`}>查看详情</Link>
        </Button>
        <Button size="sm">聊一聊</Button>
      </CardFooter>
    </Card>
  )
} 
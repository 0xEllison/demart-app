import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 定义Product类型，匹配prisma模型
type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  location: string | null;
  sellerId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 获取单个商品的详细信息
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // 获取商品详情
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    }) as unknown as Product;

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 获取卖家信息
    const seller = await prisma.user.findUnique({
      where: { id: product.sellerId },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    // 转换日期为字符串，以便JSON序列化
    const formattedProduct = {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      seller: seller || { id: product.sellerId, name: null, image: null },
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("获取商品详情失败:", error);
    return NextResponse.json(
      { error: "获取商品详情失败" },
      { status: 500 }
    );
  }
} 
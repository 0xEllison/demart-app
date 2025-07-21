import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
 * 获取商品列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    // 构建查询条件
    const where: any = {
      status: "ACTIVE",
    };

    if (category) {
      // 如果将来添加了分类字段，可以在这里添加分类筛选
    }

    // 构建排序条件
    let orderBy: any = {
      createdAt: "desc", // 默认按创建时间倒序
    };

    if (sortBy === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price-desc") {
      orderBy = { price: "desc" };
    }

    // 查询商品
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    }) as unknown as Product[];

    // 获取所有卖家ID
    const sellerIds = [...new Set(products.map(product => product.sellerId))];
    
    // 批量查询卖家信息
    const sellers = await prisma.user.findMany({
      where: {
        id: {
          in: sellerIds,
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
      }
    });
    
    // 创建卖家ID到卖家信息的映射
    const sellerMap = sellers.reduce((map, seller) => {
      map[seller.id] = seller;
      return map;
    }, {} as Record<string, any>);

    // 组合商品和卖家信息
    const productsWithSellers = products.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      seller: sellerMap[product.sellerId] || null,
    }));

    // 查询商品总数
    const totalCount = await prisma.product.count({ where });

    return NextResponse.json({
      products: productsWithSellers,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json(
      { error: "获取商品列表失败" },
      { status: 500 }
    );
  }
} 

/**
 * 创建新商品
 */
export async function POST(request: Request) {
  try {
    // 获取当前用户会话
    const session = await getServerSession(authOptions);

    // 如果未登录，返回401
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 解析请求体
    const data = await request.json();
    
    // 验证必填字段
    if (!data.title) {
      return NextResponse.json({ error: "商品标题不能为空" }, { status: 400 });
    }
    if (!data.description) {
      return NextResponse.json({ error: "商品描述不能为空" }, { status: 400 });
    }
    if (!data.price || isNaN(data.price) || data.price <= 0) {
      return NextResponse.json({ error: "价格必须大于0" }, { status: 400 });
    }
    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      return NextResponse.json({ error: "至少需要一张商品图片" }, { status: 400 });
    }

    // 创建新商品
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || "USDC", // 默认货币
        images: data.images,
        location: data.location || null,
        sellerId: session.user.id,
        status: "ACTIVE", // 默认状态为激活
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("创建商品失败:", error);
    return NextResponse.json(
      { error: "创建商品失败" },
      { status: 500 }
    );
  }
} 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductPage from '@/app/products/[id]/page';
import { CartProvider } from '@/lib/cart-context';
import * as nextNavigation from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ImageCarousel } from '@/components/ui/image-carousel';

// 模拟Next.js的路由和会话
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  notFound: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// 模拟浏览历史记录函数
jest.mock('@/lib/browse-history', () => ({
  addToBrowseHistory: jest.fn(),
}));

// 模拟图片轮播组件
jest.mock('@/components/ui/image-carousel', () => ({
  ImageCarousel: jest.fn(() => <div data-testid="image-carousel">Image Carousel</div>),
}));

// 模拟全局fetch
global.fetch = jest.fn();

describe('商品详情页测试', () => {
  const mockProduct = {
    id: 'product-1',
    title: '测试商品',
    description: '这是一个测试商品描述',
    price: 100,
    currency: 'USDC',
    images: ['/test.jpg'],
    location: '北京',
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00.000Z',
    seller: {
      id: 'seller-1',
      name: '测试卖家',
      image: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟未登录状态
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    // 模拟fetch返回商品数据
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProduct),
    });
  });

  test('商品详情页可以正确显示商品信息', async () => {
    render(
      <CartProvider>
        <ProductPage params={{ id: 'product-1' }} />
      </CartProvider>
    );

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument();
      expect(screen.getByText('这是一个测试商品描述')).toBeInTheDocument();
      expect(screen.getByText('¥100')).toBeInTheDocument();
      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.getByText('测试卖家')).toBeInTheDocument();
      expect(screen.getByTestId('image-carousel')).toBeInTheDocument();
      
      // 检查按钮
      expect(screen.getByText('聊一聊')).toBeInTheDocument();
      expect(screen.getByText(/加入购物车/)).toBeInTheDocument();
    });
  });

  test('点击加入购物车按钮后状态变化', async () => {
    // 使用真实的计时器以便测试setTimeout
    jest.useRealTimers();
    
    render(
      <CartProvider>
        <ProductPage params={{ id: 'product-1' }} />
      </CartProvider>
    );

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText(/加入购物车/)).toBeInTheDocument();
    });

    // 点击加入购物车按钮
    fireEvent.click(screen.getByText(/加入购物车/));

    // 验证按钮文本变化
    expect(screen.getByText('已加入购物车')).toBeInTheDocument();
    expect(screen.getByText('已加入购物车')).toBeDisabled();

    // 等待3秒后按钮恢复
    await new Promise((resolve) => setTimeout(resolve, 3100));

    await waitFor(() => {
      expect(screen.getByText(/加入购物车/)).toBeInTheDocument();
      expect(screen.getByText(/加入购物车/)).not.toBeDisabled();
    });
  });

  test('加载失败时显示错误信息', async () => {
    // 模拟fetch失败
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(
      <CartProvider>
        <ProductPage params={{ id: 'product-1' }} />
      </CartProvider>
    );

    // 等待错误信息显示
    await waitFor(() => {
      expect(screen.getByText('获取商品信息失败，请刷新页面重试')).toBeInTheDocument();
    });
  });

  test('商品不存在时调用notFound', async () => {
    // 模拟fetch返回404
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(
      <CartProvider>
        <ProductPage params={{ id: 'product-1' }} />
      </CartProvider>
    );

    // 验证notFound被调用
    await waitFor(() => {
      expect(nextNavigation.notFound).toHaveBeenCalled();
    });
  });
}); 
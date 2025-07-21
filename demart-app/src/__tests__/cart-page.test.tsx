import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPage from '@/app/cart/page';
import { CartProvider } from '@/lib/cart-context';
import * as cartUtils from '@/lib/cart';
import { useRouter } from 'next/navigation';

// 模拟Next.js的路由
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// 模拟购物车工具函数
jest.mock('@/lib/cart', () => ({
  getCart: jest.fn(),
  saveCart: jest.fn(),
  getCartTotal: jest.fn(),
  getCartItemCount: jest.fn(),
}));

describe('购物车页面测试', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // 默认返回空购物车
    (cartUtils.getCart as jest.Mock).mockReturnValue([]);
    (cartUtils.getCartTotal as jest.Mock).mockReturnValue(0);
    (cartUtils.getCartItemCount as jest.Mock).mockReturnValue(0);
  });

  test('购物车为空时显示空购物车提示', async () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // 等待客户端渲染完成
    await waitFor(() => {
      expect(screen.getByText('购物车是空的')).toBeInTheDocument();
      expect(screen.getByText('您的购物车中还没有商品，去浏览商品吧！')).toBeInTheDocument();
      expect(screen.getByText('浏览商品')).toBeInTheDocument();
    });
  });

  test('购物车有商品时显示商品列表', async () => {
    const mockCartItems = [
      {
        id: '1',
        title: '测试商品1',
        price: 100,
        currency: 'USDC',
        imageUrl: '/test1.jpg',
        sellerId: 'seller1',
        sellerName: '测试卖家1',
        quantity: 1,
      },
      {
        id: '2',
        title: '测试商品2',
        price: 200,
        currency: 'USDC',
        imageUrl: '/test2.jpg',
        sellerId: 'seller2',
        sellerName: '测试卖家2',
        quantity: 2,
      },
    ];

    (cartUtils.getCart as jest.Mock).mockReturnValue(mockCartItems);
    (cartUtils.getCartTotal as jest.Mock).mockReturnValue(500);
    (cartUtils.getCartItemCount as jest.Mock).mockReturnValue(3);

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // 等待客户端渲染完成
    await waitFor(() => {
      // 检查商品是否显示
      expect(screen.getByText('测试商品1')).toBeInTheDocument();
      expect(screen.getByText('测试商品2')).toBeInTheDocument();
      
      // 检查总计
      expect(screen.getByText('总计')).toBeInTheDocument();
      expect(screen.getByText('500 USDC')).toBeInTheDocument();
      
      // 检查商品数量
      expect(screen.getByText('3 件')).toBeInTheDocument();
      
      // 检查按钮
      expect(screen.getByText('去结算')).toBeInTheDocument();
      expect(screen.getByText('继续购物')).toBeInTheDocument();
      expect(screen.getByText('清空购物车')).toBeInTheDocument();
    });
  });

  test('点击去结算按钮时跳转到结算页面', async () => {
    const mockCartItems = [
      {
        id: '1',
        title: '测试商品1',
        price: 100,
        currency: 'USDC',
        imageUrl: '/test1.jpg',
        sellerId: 'seller1',
        sellerName: '测试卖家1',
        quantity: 1,
      },
    ];

    (cartUtils.getCart as jest.Mock).mockReturnValue(mockCartItems);
    (cartUtils.getCartTotal as jest.Mock).mockReturnValue(100);
    (cartUtils.getCartItemCount as jest.Mock).mockReturnValue(1);

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // 等待客户端渲染完成
    await waitFor(() => {
      expect(screen.getByText('去结算')).toBeInTheDocument();
    });

    // 点击去结算按钮
    fireEvent.click(screen.getByText('去结算'));

    // 验证路由跳转
    expect(mockRouter.push).toHaveBeenCalledWith('/checkout');
  });
}); 
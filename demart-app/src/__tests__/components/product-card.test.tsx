import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product/product-card';
import '@testing-library/jest-dom';

// 模拟 next/image 组件
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // 将 fill 属性转换为字符串
    const imgProps = { ...props };
    if (typeof imgProps.fill === 'boolean') {
      imgProps.fill = imgProps.fill.toString();
    }
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    title: 'Test Product',
    price: '99.99',
    currency: 'USDC',
    image: '/test-image.jpg',
    seller: {
      name: 'test_seller',
      avatar: '/test-avatar.jpg',
      rating: 4.5
    }
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    // 检查产品标题
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    // 检查产品价格
    expect(screen.getByText(/99.99 USDC/)).toBeInTheDocument();
    
    // 检查卖家信息
    expect(screen.getByText('@test_seller')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();
  });

  it('handles long product titles correctly', () => {
    const longTitleProduct = {
      ...mockProduct,
      title: 'This is a very long product title that should be truncated in the UI to ensure proper display and consistent card heights'
    };
    
    render(<ProductCard product={longTitleProduct} />);
    
    const titleElement = screen.getByText('This is a very long product title that should be truncated in the UI to ensure proper display and consistent card heights');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('line-clamp-2');
  });

  it('formats price correctly', () => {
    const priceTestProduct = {
      ...mockProduct,
      price: '1234.5'
    };
    
    render(<ProductCard product={priceTestProduct} />);
    
    // 价格应该被格式化为带有千位分隔符和两位小数
    expect(screen.getByText(/1,234.50 USDC/)).toBeInTheDocument();
  });
}); 
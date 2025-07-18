import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
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

describe('Home Page', () => {
  it('renders the filter sections', () => {
    render(<Home />);
    
    // 检查筛选器是否存在
    expect(screen.getByText('全球')).toBeInTheDocument();
    expect(screen.getByText('所有分类')).toBeInTheDocument();
    expect(screen.getByText('最新发布')).toBeInTheDocument();
  });

  it('renders product cards', () => {
    render(<Home />);
    
    // 检查示例产品是否存在
    expect(screen.getByText('MacBook Pro M3 14寸 (2024)')).toBeInTheDocument();
    expect(screen.getByText('Minecraft钻石剑（附魔）')).toBeInTheDocument();
    expect(screen.getByText('Logo设计服务（3天交付）')).toBeInTheDocument();
  });

  it('renders the load more button', () => {
    render(<Home />);
    
    // 检查加载更多按钮是否存在
    expect(screen.getByText('加载更多...')).toBeInTheDocument();
  });
}); 
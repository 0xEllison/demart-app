import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'
import ProductPage from '@/app/products/[id]/page'
import { useRouter } from 'next/navigation'

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(),
}))

// 模拟next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}))

// 模拟浏览历史库
jest.mock('@/lib/browse-history', () => ({
  addToBrowseHistory: jest.fn(),
  getBrowseHistory: jest.fn(() => [
    {
      id: 'product-1',
      title: '测试商品1',
      imageUrl: '/placeholder.jpg',
      price: 100,
      viewedAt: new Date().toISOString(),
    },
    {
      id: 'product-2',
      title: '测试商品2',
      imageUrl: '/placeholder.jpg',
      price: 200,
      viewedAt: new Date().toISOString(),
    },
  ]),
  clearBrowseHistory: jest.fn(),
  removeBrowseHistoryItem: jest.fn(),
}))

// 模拟fetch
global.fetch = jest.fn()

describe('浏览商品功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // 模拟useRouter返回值
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    })
    
    // 模拟fetch返回值
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/products/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-product-id',
            title: '测试商品',
            description: '这是一个测试商品',
            price: 100,
            currency: 'USDC',
            images: ['/placeholder.jpg'],
            location: '测试地点',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            seller: {
              id: 'seller-id',
              name: '测试卖家',
              image: '/images/avatar-1.png',
            },
          }),
        })
      }
      
      return Promise.reject(new Error('未模拟的fetch调用'))
    })
  })

  test('商品详情页应显示商品信息', async () => {
    render(<ProductPage params={{ id: 'test-product-id' }} />)
    
    // 等待商品数据加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 验证商品信息是否正确显示
    expect(screen.getByText('¥100')).toBeInTheDocument()
    expect(screen.getByText('测试卖家')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试商品')).toBeInTheDocument()
    
    // 验证是否调用了addToBrowseHistory
    const { addToBrowseHistory } = require('@/lib/browse-history')
    expect(addToBrowseHistory).toHaveBeenCalledWith({
      id: 'test-product-id',
      title: '测试商品',
      imageUrl: '/placeholder.jpg',
      price: 100,
    })
  })

  test('商品详情页应显示卖家信息', async () => {
    render(<ProductPage params={{ id: 'test-product-id' }} />)
    
    // 等待商品数据加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 验证卖家信息是否正确显示
    expect(screen.getByText('测试卖家')).toBeInTheDocument()
    expect(screen.getByText('卖家')).toBeInTheDocument()
  })

  test('商品详情页应有"聊一聊"按钮', async () => {
    render(<ProductPage params={{ id: 'test-product-id' }} />)
    
    // 等待商品数据加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 验证是否有"聊一聊"按钮
    expect(screen.getByText('聊一聊')).toBeInTheDocument()
  })
}) 
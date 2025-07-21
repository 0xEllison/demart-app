import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProductPage from '@/app/products/[id]/page'
import { useRouter } from 'next/navigation'

// 模拟next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(),
}))

// 模拟fetch
global.fetch = jest.fn()

describe('聊天功能测试', () => {
  // 在每个测试前重置模拟
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
      } else if (url === '/api/conversations') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-conversation-id',
          }),
        })
      }
      
      return Promise.reject(new Error('未模拟的fetch调用'))
    })
  })

  test('未登录用户点击"聊一聊"按钮应跳转到登录页面', async () => {
    // 模拟未登录状态
    const mockUseSession = require('next-auth/react').useSession as jest.Mock
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
    
    render(<ProductPage params={{ id: 'test-product-id' }} />)
    
    // 等待商品数据加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 点击"聊一聊"按钮
    fireEvent.click(screen.getByText('聊一聊'))
    
    // 验证是否跳转到登录页面
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith('/login?redirect=/products/test-product-id')
    })
  })

  test('已登录用户点击"聊一聊"按钮应创建会话并跳转', async () => {
    // 模拟已登录状态
    const mockUseSession = require('next-auth/react').useSession as jest.Mock
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'buyer-id',
          name: '测试买家',
          email: 'buyer@example.com',
          image: '/images/avatar-1.png',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    })
    
    render(<ProductPage params={{ id: 'test-product-id' }} />)
    
    // 等待商品数据加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 点击"聊一聊"按钮
    fireEvent.click(screen.getByText('聊一聊'))
    
    // 验证是否创建会话
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/conversations', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('seller-id'),
      }))
    })
    
    // 验证是否跳转到会话页面
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith('/messages/test-conversation-id')
    })
  })

  test('用户尝试与自己聊天应显示警告', async () => {
    // 模拟已登录状态，用户是卖家自己
    const mockUseSession = require('next-auth/react').useSession as jest.Mock
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'seller-id', // 与商品卖家ID相同
          name: '测试卖家',
          email: 'seller@example.com',
          image: '/images/avatar-1.png',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    })
    
    // 模拟alert
    const originalAlert = window.alert
    window.alert = jest.fn()
    
    render(<ProductPage params={{ id: 'test-product-id' }} />)
    
    // 等待商品数据加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 点击"聊一聊"按钮
    fireEvent.click(screen.getByText('聊一聊'))
    
    // 验证是否显示警告
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('不能与自己聊天')
    })
    
    // 验证没有创建会话
    expect(global.fetch).not.toHaveBeenCalledWith('/api/conversations', expect.anything())
    
    // 恢复原始alert
    window.alert = originalAlert
  })
}) 
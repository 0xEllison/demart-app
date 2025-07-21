import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BrowseHistoryPage from '@/app/browse-history/page'
import { useRouter } from 'next/navigation'

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// 模拟浏览历史库
jest.mock('@/lib/browse-history', () => {
  const mockHistory = [
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
  ]
  
  return {
    addToBrowseHistory: jest.fn(),
    getBrowseHistory: jest.fn(() => [...mockHistory]),
    clearBrowseHistory: jest.fn(),
    removeBrowseHistoryItem: jest.fn((id) => {
      mockHistory.splice(mockHistory.findIndex(item => item.id === id), 1)
    }),
  }
})

describe('浏览历史功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // 模拟useRouter返回值
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    })
  })

  test('浏览历史页面应显示历史记录', async () => {
    render(<BrowseHistoryPage />)
    
    // 验证是否显示了浏览历史
    expect(screen.getByText('测试商品1')).toBeInTheDocument()
    expect(screen.getByText('测试商品2')).toBeInTheDocument()
    expect(screen.getByText('¥100')).toBeInTheDocument()
    expect(screen.getByText('¥200')).toBeInTheDocument()
  })

  test('点击清空按钮应调用clearBrowseHistory', async () => {
    render(<BrowseHistoryPage />)
    
    // 点击清空按钮
    fireEvent.click(screen.getByText('清空历史'))
    
    // 验证是否调用了clearBrowseHistory
    const { clearBrowseHistory } = require('@/lib/browse-history')
    expect(clearBrowseHistory).toHaveBeenCalled()
  })

  test('点击删除按钮应调用removeBrowseHistoryItem', async () => {
    render(<BrowseHistoryPage />)
    
    // 找到所有删除按钮
    const deleteButtons = screen.getAllByRole('button', { name: /删除/i })
    
    // 点击第一个删除按钮
    fireEvent.click(deleteButtons[0])
    
    // 验证是否调用了removeBrowseHistoryItem
    const { removeBrowseHistoryItem } = require('@/lib/browse-history')
    expect(removeBrowseHistoryItem).toHaveBeenCalledWith('product-1')
  })

  test('点击商品卡片应跳转到商品详情页', async () => {
    render(<BrowseHistoryPage />)
    
    // 找到第一个商品卡片
    const productCard = screen.getByText('测试商品1').closest('a')
    
    // 点击商品卡片
    if (productCard) {
      fireEvent.click(productCard)
    }
    
    // 验证是否跳转到商品详情页
    expect(useRouter().push).toHaveBeenCalledWith('/products/product-1')
  })
}) 
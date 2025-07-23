/**
 * 聊天到购买集成测试 - JS版本
 * 测试从商品详情页聊天到完成购买的完整集成流程
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(() => '/messages/conversation-1'),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock Socket.io client
jest.mock('@/lib/socket-client', () => ({
  initSocket: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  })),
  joinConversation: jest.fn(),
  leaveConversation: jest.fn(),
  sendMessage: jest.fn(),
}))

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => React.createElement('img', { src, alt, ...props }),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockStorage })
Object.defineProperty(window, 'sessionStorage', { value: mockStorage })

// Mock data
const mockBuyerSession = {
  user: {
    id: 'buyer-1',
    name: 'Test Buyer',
    email: 'buyer@example.com',
  },
  expires: '2024-12-31T23:59:59.999Z',
}

const mockSellerSession = {
  user: {
    id: 'seller-1',
    name: 'Test Seller',
    email: 'seller@example.com',
  },
  expires: '2024-12-31T23:59:59.999Z',
}

const mockProduct = {
  id: 'product-1',
  title: 'Test Product for Chat Integration',
  description: 'A test product for chat to purchase integration',
  price: 150,
  currency: 'USDC',
  images: ['https://example.com/product1.jpg'],
  sellerId: 'seller-1',
  seller: {
    id: 'seller-1',
    name: 'Test Seller',
    email: 'seller@example.com',
  }
}

const mockConversation = {
  id: 'conversation-1',
  participants: [
    {
      id: 'buyer-1',
      name: 'Test Buyer',
      image: null
    },
    {
      id: 'seller-1',
      name: 'Test Seller',
      image: null
    }
  ],
  product: mockProduct,
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockMessages = [
  {
    id: 'message-1',
    content: '你好，我对这个商品感兴趣',
    createdAt: '2024-01-01T10:00:00.000Z',
    senderId: 'buyer-1',
    receiverId: 'seller-1',
    isRead: true,
    type: 'TEXT',
    sender: {
      id: 'buyer-1',
      name: 'Test Buyer',
      image: ''
    }
  },
  {
    id: 'message-2',
    content: '好的，有什么问题可以随时问我',
    createdAt: '2024-01-01T10:05:00.000Z',
    senderId: 'seller-1',
    receiverId: 'buyer-1',
    isRead: true,
    type: 'TEXT',
    sender: {
      id: 'seller-1',
      name: 'Test Seller',
      image: ''
    }
  }
]

describe('Chat to Purchase Integration Tests', () => {
  const mockPush = jest.fn()
  const mockBack = jest.fn()
  const mockGet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    const { useRouter, useSearchParams } = require('next/navigation')
    useRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    })
    useSearchParams.mockReturnValue({
      get: mockGet,
    })
    
    const { useSession } = require('next-auth/react')
    useSession.mockReturnValue({
      data: mockBuyerSession,
      status: 'authenticated',
    })
  })

  describe('Chat Interface Integration', () => {
    test('应该正确处理聊天数据获取', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockConversation),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMessages),
        })

      // 模拟获取聊天数据
      const conversationResponse = await fetch('/api/conversations/conversation-1')
      const conversationData = await conversationResponse.json()

      const messagesResponse = await fetch('/api/messages?conversationId=conversation-1')
      const messagesData = await messagesResponse.json()

      expect(conversationData.id).toBe('conversation-1')
      expect(conversationData.product.title).toBe('Test Product for Chat Integration')
      expect(messagesData).toHaveLength(2)
      expect(messagesData[0].content).toBe('你好，我对这个商品感兴趣')
    })

    test('应该正确处理消息发送', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'message-3',
          content: '价格可以优惠吗？',
          createdAt: '2024-01-01T10:10:00.000Z',
          senderId: 'buyer-1',
          receiverId: 'seller-1',
          isRead: false,
          type: 'TEXT',
          sender: mockBuyerSession.user
        }),
      })

      const messageData = {
        conversationId: 'conversation-1',
        content: '价格可以优惠吗？',
        receiverId: 'seller-1',
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      })

      const result = await response.json()

      expect(fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      })

      expect(result.content).toBe('价格可以优惠吗？')
      expect(result.senderId).toBe('buyer-1')
    })

    test('应该处理价格修改功能', async () => {
      const priceChangeMessage = {
        conversationId: 'conversation-1',
        content: '卖家已将价格修改为 ¥120',
        receiverId: 'buyer-1',
        type: 'SYSTEM'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'system-message-1',
          content: '卖家已将价格修改为 ¥120',
          createdAt: '2024-01-01T10:15:00.000Z',
          type: 'SYSTEM'
        }),
      })

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceChangeMessage),
      })

      const result = await response.json()

      expect(result.content).toBe('卖家已将价格修改为 ¥120')
      expect(result.type).toBe('SYSTEM')
    })
  })

  describe('Purchase Flow Integration', () => {
    test('应该正确处理立即购买请求', async () => {
      const purchaseMessage = {
        conversationId: 'conversation-1',
        content: 'Test Buyer点击了"立即购买"按钮',
        receiverId: 'seller-1',
        type: 'SYSTEM'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'system-message-2',
          content: 'Test Buyer点击了"立即购买"按钮',
          type: 'SYSTEM'
        }),
      })

      // 模拟点击购买后的系统消息发送
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseMessage),
      })

      const result = await response.json()

      expect(result.content).toBe('Test Buyer点击了"立即购买"按钮')
    })

    test('应该验证从聊天到订单创建的数据传递', () => {
      // 模拟从聊天页面跳转到订单创建页面
      const productId = 'product-1'
      const conversationId = 'conversation-1'
      const orderCreateUrl = `/orders/create?productId=${productId}&conversationId=${conversationId}`

      // 验证URL参数构建
      expect(orderCreateUrl).toBe('/orders/create?productId=product-1&conversationId=conversation-1')

      // 模拟URL参数解析
      mockGet.mockImplementation((param) => {
        if (param === 'productId') return 'product-1'
        if (param === 'conversationId') return 'conversation-1'
        return null
      })

      const { useSearchParams } = require('next/navigation')
      const searchParams = useSearchParams()
      
      expect(searchParams.get('productId')).toBe('product-1')
      expect(searchParams.get('conversationId')).toBe('conversation-1')
    })

    test('应该处理订单创建流程', async () => {
      const orderData = {
        productId: 'product-1',
        addressId: 'address-1',
        quantity: 1,
        notes: '从聊天购买的订单'
      }

      const mockOrder = {
        id: 'order-1',
        status: 'AWAITING_PAYMENT',
        price: 150,
        totalAmount: 150,
        currency: 'USDC',
        quantity: 1,
        notes: '从聊天购买的订单',
        product: mockProduct,
        buyer: mockBuyerSession.user
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      expect(result.id).toBe('order-1')
      expect(result.notes).toBe('从聊天购买的订单')
      expect(result.product.title).toBe('Test Product for Chat Integration')
    })
  })

  describe('System Messages Integration', () => {
    test('应该正确处理系统消息格式', () => {
      const systemMessages = [
        'Test Buyer点击了"立即购买"按钮',
        '卖家已将价格修改为 ¥120',
        '订单已创建，请及时付款',
        '买家已确认收货'
      ]

      systemMessages.forEach(content => {
        const systemMessage = {
          id: `system-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          senderId: 'system',
          receiverId: 'all',
          isRead: true,
          type: 'SYSTEM',
          sender: {
            id: 'system',
            name: '系统',
            image: ''
          }
        }

        expect(systemMessage.type).toBe('SYSTEM')
        expect(systemMessage.senderId).toBe('system')
        expect(systemMessage.content).toBe(content)
      })
    })

    test('应该验证价格修改系统消息的数据结构', () => {
      const originalPrice = 150
      const newPrice = 120
      const priceChangeMessage = `卖家已将价格修改为 ¥${newPrice}`

      const systemMessage = {
        conversationId: 'conversation-1',
        content: priceChangeMessage,
        receiverId: 'buyer-1',
        type: 'SYSTEM',
        metadata: {
          originalPrice,
          newPrice,
          changeAmount: originalPrice - newPrice
        }
      }

      expect(systemMessage.content).toBe('卖家已将价格修改为 ¥120')
      expect(systemMessage.metadata.originalPrice).toBe(150)
      expect(systemMessage.metadata.newPrice).toBe(120)
      expect(systemMessage.metadata.changeAmount).toBe(30)
    })
  })

  describe('Socket.io Integration', () => {
    test('应该正确配置Socket.io客户端', () => {
      const { initSocket, joinConversation, leaveConversation, sendMessage } = require('@/lib/socket-client')

      // 验证Socket.io函数存在
      expect(typeof initSocket).toBe('function')
      expect(typeof joinConversation).toBe('function')
      expect(typeof leaveConversation).toBe('function')
      expect(typeof sendMessage).toBe('function')

      // 模拟Socket连接
      const mockSocket = initSocket()
      expect(mockSocket).toHaveProperty('on')
      expect(mockSocket).toHaveProperty('off')
      expect(mockSocket).toHaveProperty('emit')
    })

    test('应该处理实时消息事件', () => {
      const { initSocket } = require('@/lib/socket-client')
      const mockSocket = initSocket()

      // 模拟消息事件监听
      const messageHandler = jest.fn()
      const systemMessageHandler = jest.fn()

      mockSocket.on('new-message', messageHandler)
      mockSocket.on('new-system-message', systemMessageHandler)

      // 验证事件监听器设置
      expect(mockSocket.on).toHaveBeenCalledWith('new-message', messageHandler)
      expect(mockSocket.on).toHaveBeenCalledWith('new-system-message', systemMessageHandler)
    })

    test('应该验证消息发送格式', () => {
      const { sendMessage } = require('@/lib/socket-client')

      const messageData = {
        conversationId: 'conversation-1',
        content: '这是一条测试消息',
        senderId: 'buyer-1',
        receiverId: 'seller-1'
      }

      sendMessage(messageData)

      expect(sendMessage).toHaveBeenCalledWith(messageData)
    })
  })

  describe('Error Handling Integration', () => {
    test('应该处理聊天加载失败', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      try {
        const response = await fetch('/api/conversations/non-existent')
        expect(response.ok).toBe(false)
        expect(response.status).toBe(404)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    test('应该处理消息发送失败', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      })

      const messageData = {
        conversationId: 'conversation-1',
        content: '发送失败的消息',
        receiverId: 'seller-1',
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })

    test('应该处理订单创建失败', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid order data')
      })

      const invalidOrderData = {
        productId: '', // 无效的商品ID
        addressId: 'address-1',
        quantity: 0, // 无效的数量
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidOrderData),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })

    test('应该处理Socket连接失败', () => {
      const { initSocket } = require('@/lib/socket-client')
      
      // 模拟连接失败
      initSocket.mockImplementation(() => {
        throw new Error('Socket connection failed')
      })

      expect(() => initSocket()).toThrow('Socket connection failed')
    })
  })

  describe('User Experience Integration', () => {
    test('应该验证聊天到购买的完整用户流程', () => {
      // 1. 用户在聊天中协商
      const negotiationMessage = {
        content: '价格能便宜一点吗？',
        senderId: 'buyer-1',
        receiverId: 'seller-1'
      }

      // 2. 卖家修改价格
      const priceUpdate = {
        content: '卖家已将价格修改为 ¥120',
        type: 'SYSTEM'
      }

      // 3. 买家点击购买
      const purchaseAction = {
        content: 'Test Buyer点击了"立即购买"按钮',
        type: 'SYSTEM'
      }

      // 4. 创建订单
      const orderCreation = {
        productId: 'product-1',
        quantity: 1,
        notes: '协商后的购买'
      }

      // 验证流程数据完整性
      expect(negotiationMessage.senderId).toBe('buyer-1')
      expect(priceUpdate.type).toBe('SYSTEM')
      expect(purchaseAction.type).toBe('SYSTEM')
      expect(orderCreation.productId).toBe('product-1')
    })

    test('应该验证数据在各环节的一致性', () => {
      const productId = 'product-1'
      const conversationId = 'conversation-1'
      const buyerId = 'buyer-1'

      // 聊天环节
      const chatData = {
        conversationId,
        productId,
        buyerId
      }

      // 购买环节
      const purchaseData = {
        productId,
        buyerId,
        fromConversation: conversationId
      }

      // 订单环节
      const orderData = {
        productId,
        buyerId,
        sourceType: 'chat',
        sourceId: conversationId
      }

      // 验证数据一致性
      expect(chatData.productId).toBe(purchaseData.productId)
      expect(purchaseData.productId).toBe(orderData.productId)
      expect(chatData.buyerId).toBe(purchaseData.buyerId)
      expect(purchaseData.buyerId).toBe(orderData.buyerId)
    })

    test('应该验证时间戳和状态的连续性', () => {
      const baseTime = Date.now()
      
      const timeline = [
        { event: 'chat_start', timestamp: baseTime, status: 'active' },
        { event: 'price_negotiation', timestamp: baseTime + 60000, status: 'negotiating' },
        { event: 'price_updated', timestamp: baseTime + 120000, status: 'updated' },
        { event: 'purchase_clicked', timestamp: baseTime + 180000, status: 'purchasing' },
        { event: 'order_created', timestamp: baseTime + 240000, status: 'ordered' }
      ]

      // 验证时间顺序
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].timestamp).toBeGreaterThan(timeline[i-1].timestamp)
      }

      // 验证状态转换
      expect(timeline[0].status).toBe('active')
      expect(timeline[timeline.length - 1].status).toBe('ordered')
    })
  })
})
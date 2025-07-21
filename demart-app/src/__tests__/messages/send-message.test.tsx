import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConversationPage from '@/app/messages/[id]/page'
import { useRouter } from 'next/navigation'

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// 模拟next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'user-1',
        name: '测试用户',
        email: 'test@example.com',
        image: '/images/avatar-1.png',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
}))

// 模拟socket-client
jest.mock('@/lib/socket-client', () => ({
  initSocket: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
  })),
  joinConversation: jest.fn(),
  leaveConversation: jest.fn(),
  sendMessage: jest.fn(),
  closeSocket: jest.fn(),
}))

// 模拟fetch
global.fetch = jest.fn()

describe('消息发送功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // 模拟useRouter返回值
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    })
    
    // 模拟fetch返回值
    ;(global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url.includes('/api/conversations/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'conversation-1',
            participants: [
              {
                id: 'user-1',
                name: '测试用户',
                image: '/images/avatar-1.png',
              },
              {
                id: 'user-2',
                name: '测试卖家',
                image: '/images/avatar-2.png',
              },
            ],
            product: {
              id: 'product-1',
              title: '测试商品',
              images: ['/placeholder.jpg'],
              price: 100,
            },
            updatedAt: new Date().toISOString(),
          }),
        })
      } else if (url.includes('/api/messages')) {
        if (options?.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              {
                id: 'message-1',
                content: '你好',
                createdAt: new Date().toISOString(),
                senderId: 'user-1',
                receiverId: 'user-2',
                isRead: true,
                type: 'TEXT',
                sender: {
                  id: 'user-1',
                  name: '测试用户',
                  image: '/images/avatar-1.png',
                },
              },
              {
                id: 'message-2',
                content: '你好，请问有什么可以帮到你？',
                createdAt: new Date().toISOString(),
                senderId: 'user-2',
                receiverId: 'user-1',
                isRead: true,
                type: 'TEXT',
                sender: {
                  id: 'user-2',
                  name: '测试卖家',
                  image: '/images/avatar-2.png',
                },
              },
            ]),
          })
        } else if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 'message-3',
              content: JSON.parse(options.body as string).content,
              createdAt: new Date().toISOString(),
              senderId: 'user-1',
              receiverId: 'user-2',
              isRead: false,
              type: 'TEXT',
              sender: {
                id: 'user-1',
                name: '测试用户',
                image: '/images/avatar-1.png',
              },
            }),
          })
        }
      }
      
      return Promise.reject(new Error('未模拟的fetch调用'))
    })
  })

  test('聊天页面应显示历史消息', async () => {
    render(<ConversationPage params={{ id: 'conversation-1' }} />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText('你好')).toBeInTheDocument()
    })
    
    // 验证历史消息是否正确显示
    expect(screen.getByText('你好，请问有什么可以帮到你？')).toBeInTheDocument()
  })

  test('发送消息应调用API并更新消息列表', async () => {
    render(<ConversationPage params={{ id: 'conversation-1' }} />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText('你好')).toBeInTheDocument()
    })
    
    // 输入新消息
    const input = screen.getByPlaceholderText('输入消息...')
    fireEvent.change(input, { target: { value: '我想了解一下这个商品' } })
    
    // 点击发送按钮
    const sendButton = screen.getByText('发送')
    fireEvent.click(sendButton)
    
    // 验证是否调用了API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('我想了解一下这个商品'),
      }))
    })
    
    // 验证是否调用了sendMessage
    const { sendMessage } = require('@/lib/socket-client')
    expect(sendMessage).toHaveBeenCalled()
    
    // 验证输入框是否被清空
    expect(input).toHaveValue('')
  })

  test('商品信息应正确显示在聊天页面上方', async () => {
    render(<ConversationPage params={{ id: 'conversation-1' }} />)
    
    // 等待页面加载
    await waitFor(() => {
      expect(screen.getByText('测试商品')).toBeInTheDocument()
    })
    
    // 验证商品信息是否正确显示
    expect(screen.getByText('¥100')).toBeInTheDocument()
    
    // 验证立即购买按钮是否存在
    expect(screen.getByText('立即购买')).toBeInTheDocument()
  })
}) 
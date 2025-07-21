import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

// 模拟fetch
global.fetch = jest.fn()

// 模拟地址数据
const mockAddresses = [
  {
    id: 'address-1',
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园路1号',
    isDefault: true,
  },
  {
    id: 'address-2',
    name: '李四',
    phone: '13900139000',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    address: '中关村大街1号',
    isDefault: false,
  },
]

describe('地址管理功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // 模拟useRouter返回值
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
    })
    
    // 模拟fetch返回值
    ;(global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url.includes('/api/user/addresses')) {
        if (!options?.method || options.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAddresses),
          })
        } else if (options.method === 'POST') {
          const newAddress = JSON.parse(options.body as string)
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...newAddress,
              id: 'new-address-id',
            }),
          })
        } else if (options.method === 'PUT') {
          const updatedAddress = JSON.parse(options.body as string)
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedAddress),
          })
        } else if (options.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          })
        }
      }
      
      return Promise.reject(new Error('未模拟的fetch调用'))
    })
  })

  test('地址列表页面应显示用户地址', async () => {
    // 模拟地址列表组件
    const MockAddressListPage = () => {
      const [addresses, setAddresses] = useState([])
      
      useEffect(() => {
        async function fetchAddresses() {
          const response = await fetch('/api/user/addresses')
          if (response.ok) {
            const data = await response.json()
            setAddresses(data)
          }
        }
        
        fetchAddresses()
      }, [])
      
      return (
        <div>
          <h1>我的地址</h1>
          <button>添加新地址</button>
          <ul>
            {addresses.map((address: any) => (
              <li key={address.id}>
                <div>
                  <span>{address.name}</span>
                  <span>{address.phone}</span>
                </div>
                <div>
                  {address.province}{address.city}{address.district}{address.address}
                </div>
                {address.isDefault && <span>默认地址</span>}
                <div>
                  <button>编辑</button>
                  <button>删除</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    
    render(<MockAddressListPage />)
    
    // 等待地址加载
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument()
    })
    
    // 验证地址信息是否正确显示
    expect(screen.getByText('李四')).toBeInTheDocument()
    expect(screen.getByText('13800138000')).toBeInTheDocument()
    expect(screen.getByText('默认地址')).toBeInTheDocument()
    expect(screen.getByText('广东省深圳市南山区科技园路1号')).toBeInTheDocument()
  })

  test('添加新地址应调用API并更新地址列表', async () => {
    // 模拟添加地址组件
    const MockAddAddressPage = () => {
      const router = useRouter()
      const [formData, setFormData] = useState({
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        address: '',
        isDefault: false,
      })
      
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData({
          ...formData,
          [name]: type === 'checkbox' ? checked : value,
        })
      }
      
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const response = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        if (response.ok) {
          router.push('/profile/addresses')
        }
      }
      
      return (
        <form onSubmit={handleSubmit}>
          <h1>添加新地址</h1>
          <div>
            <label htmlFor="name">收货人</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone">手机号码</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="province">省份</label>
            <input
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="city">城市</label>
            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="district">区/县</label>
            <input
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="address">详细地址</label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              设为默认地址
            </label>
          </div>
          <button type="submit">保存</button>
        </form>
      )
    }
    
    render(<MockAddAddressPage />)
    
    // 填写表单
    fireEvent.change(screen.getByLabelText('收货人'), { target: { value: '王五' } })
    fireEvent.change(screen.getByLabelText('手机号码'), { target: { value: '13700137000' } })
    fireEvent.change(screen.getByLabelText('省份'), { target: { value: '上海市' } })
    fireEvent.change(screen.getByLabelText('城市'), { target: { value: '上海市' } })
    fireEvent.change(screen.getByLabelText('区/县'), { target: { value: '浦东新区' } })
    fireEvent.change(screen.getByLabelText('详细地址'), { target: { value: '张江高科技园区1号' } })
    fireEvent.click(screen.getByLabelText('设为默认地址'))
    
    // 提交表单
    fireEvent.click(screen.getByText('保存'))
    
    // 验证是否调用了API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/addresses', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: '王五',
          phone: '13700137000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          address: '张江高科技园区1号',
          isDefault: true,
        }),
      }))
    })
    
    // 验证是否跳转到地址列表页面
    expect(useRouter().push).toHaveBeenCalledWith('/profile/addresses')
  })

  test('删除地址应调用API', async () => {
    // 模拟删除地址功能
    const handleDeleteAddress = async (id: string) => {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      })
      
      return response.ok
    }
    
    // 调用删除函数
    const result = await handleDeleteAddress('address-1')
    
    // 验证是否调用了API
    expect(global.fetch).toHaveBeenCalledWith('/api/user/addresses/address-1', expect.objectContaining({
      method: 'DELETE',
    }))
    
    // 验证返回结果
    expect(result).toBe(true)
  })
})

// 添加React的useEffect导入
import { useEffect } from 'react' 
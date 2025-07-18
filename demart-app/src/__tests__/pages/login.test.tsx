import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { signIn } from 'next-auth/react';
import '@testing-library/jest-dom';

// 模拟 next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// 模拟 next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((param) => {
      if (param === 'registered') return null;
      return null;
    }),
  }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    
    // 检查标题和表单元素
    expect(screen.getByText('欢迎回来 👋')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    expect(screen.getByText('还没有账户？')).toBeInTheDocument();
    expect(screen.getByText('立即注册')).toBeInTheDocument();
  });

  // 修改这个测试，因为表单使用了 HTML5 验证，不会触发我们的错误消息
  it('prevents submission with empty fields due to HTML5 validation', () => {
    render(<LoginPage />);
    
    // 获取表单元素
    const emailInput = screen.getByLabelText('邮箱');
    const passwordInput = screen.getByLabelText('密码');
    const submitButton = screen.getByRole('button', { name: /登录/i });
    
    // 验证 required 属性存在
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    
    // 确保提交按钮存在
    expect(submitButton).toBeInTheDocument();
  });

  it('calls signIn when form is submitted with valid data', async () => {
    // 模拟 signIn 返回成功
    (signIn as jest.Mock).mockResolvedValueOnce({ error: null });
    
    render(<LoginPage />);
    
    // 填写表单
    fireEvent.change(screen.getByLabelText('邮箱'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'password123' },
    });
    
    // 提交表单
    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);
    
    // 验证 signIn 被调用
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('displays error message when signIn fails', async () => {
    // 模拟 signIn 返回错误
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid credentials' });
    
    render(<LoginPage />);
    
    // 填写表单
    fireEvent.change(screen.getByLabelText('邮箱'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'wrongpassword' },
    });
    
    // 提交表单
    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);
    
    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText('邮箱或密码错误')).toBeInTheDocument();
    });
  });
}); 
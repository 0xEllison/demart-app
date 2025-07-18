# DeMart 应用测试指南

本文档提供了 DeMart 应用的测试指南，包括如何运行测试、编写测试和生成测试覆盖率报告。

## 测试框架

DeMart 使用以下测试框架和工具：

- Jest：JavaScript 测试框架
- React Testing Library：用于测试 React 组件
- Jest DOM：提供用于 DOM 测试的自定义匹配器

## 运行测试

### 运行所有测试

```bash
npm test
```

### 监视模式（在文件更改时自动运行测试）

```bash
npm run test:watch
```

### 自动测试运行器（更友好的界面）

```bash
npm run test:auto
```

### 生成测试覆盖率报告

```bash
npm run test:coverage
```

测试覆盖率报告将生成在 `coverage` 目录中。您可以在浏览器中打开 `coverage/lcov-report/index.html` 文件查看详细报告。

## 测试文件结构

测试文件位于 `src/__tests__` 目录中，按照以下结构组织：

- `src/__tests__/components/`：组件测试
- `src/__tests__/pages/`：页面测试
- `src/__tests__/hooks/`：自定义 Hook 测试
- `src/__tests__/utils/`：工具函数测试

## 编写测试

### 组件测试示例

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/my-component';
import '@testing-library/jest-dom';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### 页面测试示例

```tsx
import { render, screen } from '@testing-library/react';
import MyPage from '@/app/my-page/page';
import '@testing-library/jest-dom';

describe('MyPage', () => {
  it('renders correctly', () => {
    render(<MyPage />);
    expect(screen.getByRole('heading')).toHaveTextContent('My Page');
  });
});
```

## 模拟依赖

### 模拟 Next.js Image 组件

```tsx
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const imgProps = { ...props };
    if (typeof imgProps.fill === 'boolean') {
      imgProps.fill = imgProps.fill.toString();
    }
    return <img {...imgProps} />;
  },
}));
```

### 模拟 next-auth

```tsx
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ 
    data: null, 
    status: 'unauthenticated' 
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
```

### 模拟 Next.js 路由

```tsx
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));
```

## 测试覆盖率要求

- 分支覆盖率：70%
- 函数覆盖率：70%
- 行覆盖率：70%
- 语句覆盖率：70%

## 持续集成

在将代码推送到远程仓库时，GitHub Actions 将自动运行测试，确保所有测试都通过并且满足覆盖率要求。 
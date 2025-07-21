This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## 9. 项目进展 (Project Progress)

本章节记录 DeMart 项目的开发进展情况，包括已完成的功能模块和待完成的任务。

### 9.1. 已完成功能 (Completed Features)

| 功能模块 | 完成状态 | 说明 |
| :--- | :--- | :--- |
| **设计系统实现** | ✅ 已完成 | 基于Tailwind CSS和CSS变量实现了设计规范中定义的色彩系统、排版和基础组件样式。支持亮色/暗色模式切换。 |
| **浏览历史模块** | ✅ 已完成 | 实现了完整的浏览历史功能，包括：<br>- 自动记录用户浏览的商品<br>- 浏览历史页面展示<br>- 清空全部记录和删除单条记录功能<br>- 导航栏入口 |
| **基础UI组件库** | ✅ 已完成 | 基于shadcn/ui实现了按钮、卡片、头像、表单等基础组件，符合设计规范。 |
| **导航与布局** | ✅ 已完成 | 实现了响应式的导航栏和基础页面布局。 |
| **即时聊天功能** | ✅ 已完成 | 实现了基于WebSocket的实时聊天功能，包括：<br>- 文本消息收发<br>- 系统消息通知<br>- 会话列表与详情页<br>- 商品关联聊天<br>- 从聊天中发起购买 |

### 9.2. 进行中的功能 (In Progress)

| 功能模块 | 状态 | 说明 |
| :--- | :--- | :--- |
| **用户认证系统** | 🔄 进行中 | 基于NextAuth.js实现邮箱注册登录功能。 |
| **商品发布与管理** | 🔄 进行中 | 实现商品发布、编辑和管理功能。 |

### 9.3. 待开发功能 (Pending Features)

| 功能模块 | 优先级 | 说明 |
| :--- | :--- | :--- |
| **用户资料管理** | 中 | 实现用户个人资料编辑和地址管理功能。 |
| **订单与支付流程** | 中 | 实现订单创建和模拟支付流程。 |
| **评价与信誉系统** | 低 | 实现交易后的互评功能和信誉分计算。 |

### 9.4. 已知问题 (Known Issues)

1. ~~**图片加载错误**: 部分图片资源无法正确加载，控制台显示错误: "The requested resource isn't a valid image for /images/logo-design-service.jpg received text/html; charset=utf-8"~~ (已修复)
2. ~~**Next.js配置警告**: "The 'images.domains' configuration is deprecated. Please use 'images.remotePatterns' configuration instead."~~ (已修复)
3. **Prisma模型错误**: 一些API路由中存在与Prisma模型不匹配的类型错误，需要进一步修复。

### 9.5. 下一步计划 (Next Steps)

1. 修复Prisma模型错误
2. 完善用户认证系统
3. 开发商品发布与管理功能
4. 实现订单与支付流程
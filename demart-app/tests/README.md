# DeMart 应用功能测试

## 测试概述

本目录包含 DeMart 应用的功能测试脚本，使用 Playwright 进行端到端测试。

## 测试内容

1. **首页和商品列表测试**：测试首页加载、商品列表显示和商品详情页导航
2. **用户注册登录测试**：测试用户注册和登录功能
3. **聊天功能测试**：测试"聊一聊"按钮和聊天页面功能
4. **浏览历史测试**：测试浏览历史记录、查看和管理功能

## 运行测试

### 前提条件

- Node.js 环境
- 已安装 Playwright：`npm install playwright --save-dev`
- 已安装 Playwright 浏览器：`npx playwright install`
- 启动开发服务器：`npm run dev`

### 运行单个测试

```bash
node tests/run-tests.js <test-name>
```

可用的测试名称：
- `homepage`: 首页和商品列表测试
- `register`: 注册功能测试
- `chat`: 聊天功能测试
- `browse-history`: 浏览历史功能测试

### 运行所有测试

```bash
node tests/run-tests.js all
```

## 测试结果

测试结果将输出到控制台，并保存到 `tests/results` 目录中。
测试过程中的截图将保存到 `tests/screenshots` 目录中。

详细的测试报告可以查看 `tests/test-report.md` 文件。

## 已知问题

1. **登录功能**：登录后可能无法正确跳转到首页
2. **聊天功能**：创建会话后可能无法跳转到聊天页面
3. **浏览历史**：清空所有记录功能可能存在问题

## 修复建议

详细的修复建议请参考 `tests/test-report.md` 文件。 
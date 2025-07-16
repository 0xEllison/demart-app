# DeMart 设计系统 (Design System)

> **版本**: 1.0
> **状态**: `进行中`
> **目标**: 本文档定义了 DeMart 平台的视觉语言、设计原则和 UI 组件规范，旨在确保品牌一致性、提升开发效率并提供卓越的用户体验。

---

## 1. 设计哲学与愿景 (Design Philosophy & Vision)

我们的设计遵循三大核心原则，旨在将 DeMart 打造成一个既美观又值得信赖的去中心化市场。

*   **现代 (Modern)**
    *   **界面**: 采用简洁、干净的布局，拥有充足的留白，避免信息过载。
    *   **元素**: 使用柔和的阴影、优雅的圆角和清晰的排版，创造出一种轻盈、现代的感觉。
    *   **目标**: 吸引并留住习惯了现代Web应用的用户，即使在Web3世界里也能提供一流的视觉体验。

*   **值得信赖 (Trustworthy)**
    *   **清晰度**: 所有交互和信息展示都必须是清晰、无歧义的。用户需要明确知道点击一个按钮会发生什么。
    *   **一致性**: 在整个平台中重复使用相同的设计模式和组件，建立用户的熟悉感和安全感。
    *   **色彩**: 使用稳定、可靠的蓝色作为主色调，辅以代表成功的绿色，从心理学层面构建用户的信任。

*   **易用 (User-Friendly)**
    *   **引导性**: 通过视觉层级和重点突出，自然地引导用户完成核心操作，如发布商品、购买、连接钱包等。
    *   **可访问性**: 确保足够的色彩对比度，为不同能力的用户提供良好的体验。
    *   **目标**: 极大地降低Web3的操作门槛，让不熟悉区块链的用户也能感到自如和便捷。

---

## 2. 品牌色板 (Color Palette)

色彩是构建品牌识别和用户体验的基础。DeMart 的色板经过精心选择，以传达我们的核心价值。

### 2.1. 主色与辅色 (Primary & Accent)

| 颜色 | 用途 | HEX 色值 | 预览 |
| :--- | :--- | :--- | :--- |
| **Primary (主色)** | 用于关键操作按钮、链接、高亮状态和品牌标识。代表科技、稳定与信任。 | `#4A90E2` | 🔵 |
| **Accent (辅色)** | 用于强化的行动号召（如“确认购买”）、成功状态和促销活动。代表活力与成功。 | `#50E3C2` | 🟢 |

### 2.2. 中性色 (Neutrals)

中性色构成了界面的骨架，用于文本、背景、边框和分割线。

| 颜色 | 用途 | HEX 色值 | 预览 |
| :--- | :--- | :--- | :--- |
| **Rich Black** | 主要标题 (H1, H2)，用于需要最强视觉重点的文本。 | `#1A202C` | ⚫️ |
| **Body Text** | 正文、段落文本，保证最佳的可读性。 | `#4A5568` | ⚫️ |
| **Subtle Text** | 辅助性文字、提示信息、占位符文本。 | `#718096` | ⚫️ |
| **Border / Divider** | 卡片边框、分割线，用于划分界面区域。 | `#E2E8F0` | ⚪️ |
| **Light Background** | 页面的主要背景色，提供干净的画布。 | `#F7FAFC` | ⚪️ |
| **White** | 卡片、模态框等元素的背景色。 | `#FFFFFF` | ⚪️ |

### 2.3. 功能色 (System Colors)

功能色用于向用户传达特定的系统状态信息，如成功、警告或错误。

| 颜色 | 用途 | HEX 色值 | 预览 |
| :--- | :--- | :--- | :--- |
| **Success (成功)** | 交易成功提示、验证通过。 | `#38A169` | 🟢 |
| **Warning (警告)** | 需要用户注意的提示，如“Gas费可能较高”。 | `#D69E2E` | 🟡 |
| **Error (错误)** | 交易失败、输入错误、危险操作。 | `#E53E3E` | 🔴 |

---

## 3. 字体与排版 (Typography)

一致的排版系统是保证信息可读性和界面美观度的核心。我们选择现代、清晰且开源的字体，以确保在所有设备上都有出色的表现。

### 3.1. 字体家族 (Font Family)

*   **主字体**: `Inter`
    *   **理由**: Inter 是一个专为计算机屏幕设计的无衬线字体，具有极高的清晰度和可读性。它拥有多种字重，非常适合UI设计。开源免费，便于商业使用。
    *   **备用字体**: `sans-serif`。当 `Inter` 无法加载时，使用系统默认的无衬线字体。

### 3.2. 字号层级与样式 (Type Scale & Styles)

我们定义了一个响应式的、以 `rem` 为单位的字号层级，以保证可访问性。`(1rem = 16px)`

| 元素 / 用途 | 字号 (font-size) | 字重 (font-weight) | 行高 (line-height) | 颜色 |
| :--- | :--- | :--- | :--- | :--- |
| **H1 / 页面主标题** | `2.25rem` (36px) | `700` (Bold) | `2.5rem` (40px) | `Rich Black` |
| **H2 / 区域大标题** | `1.5rem` (24px) | `600` (Semi-Bold) | `2rem` (32px) | `Rich Black` |
| **H3 / 卡片、模态框标题** | `1.25rem` (20px) | `600` (Semi-Bold) | `1.75rem` (28px)| `Rich Black` |
| **H4 / 小节标题** | `1rem` (16px) | `600` (Semi-Bold) | `1.5rem` (24px) | `Rich Black` |
| **Body / 正文** | `1rem` (16px) | `400` (Regular) | `1.5rem` (24px) | `Body Text` |
| **Body (Bold)** | `1rem` (16px) | `700` (Bold) | `1.5rem` (24px) | `Body Text` |
| **Caption / 辅助说明** | `0.875rem` (14px) | `400` (Regular) | `1.25rem` (20px)| `Subtle Text` |
| **Button / 按钮文本** | `1rem` (16px) | `500` (Medium) | `1.5rem` (24px) | `White` / `Primary` |
| **Link / 链接文本** | `1rem` (16px) | `500` (Medium) | `1.5rem` (24px) | `Primary` |

---

## 4. 核心组件样式 (Component Styling)

本章节将抽象的原子（颜色、字体）组合成具体、可复用的UI组件。每个组件的规范都将包含其视觉样式、尺寸、交互状态等，为开发提供精确指导。

### 4.1. 按钮 (Button)

按钮是与用户进行交互的最核心元素。我们提供三种主要类型的按钮，以适应不同的业务场景和视觉优先级。

#### 4.1.1. 主按钮 (Primary Button)

用于最主要的用户操作，如“连接钱包”、“发布商品”、“立即购买”。

| 属性 | 值 | 备注 |
| :--- | :--- | :--- |
| **背景色** | `Primary` (`#4A90E2`) | |
| **文字颜色** | `White` (`#FFFFFF`) | |
| **字体** | 见 `Button` 文本样式 | `16px`, `Medium` |
| **内边距 (Padding)** | `0.75rem 1.5rem` (12px 24px) | 上下 12px, 左右 24px |
| **圆角 (Border-radius)**| `0.5rem` (8px) | |
| **边框 (Border)** | `none` | |
| **阴影 (Box-shadow)** | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | 提供轻微的立体感 |
| **过渡 (Transition)** | `all 0.2s ease-in-out` | 使状态变化更平滑 |

**状态 (States):**
*   **悬浮 (Hover)**:
    *   背景色变亮: `filter: brightness(1.1)`
    *   阴影增强: `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)`
    *   鼠标指针: `cursor: pointer`
*   **点击 (Active)**:
    *   背景色变暗: `filter: brightness(0.95)`
    *   移除阴影，轻微下沉: `transform: translateY(1px)`
*   **禁用 (Disabled)**:
    *   背景色: `Subtle Text` (`#718096`) 的半透明版 `rgba(113, 128, 150, 0.5)`
    *   文字颜色: `White` 的半透明版 `rgba(255, 255, 255, 0.7)`
    *   移除阴影，鼠标指针: `cursor: not-allowed`

#### 4.1.2. 次要按钮 (Secondary Button)

用于次级操作，如“取消”、“查看详情”、“保存草稿”。

| 属性 | 值 | 备注 |
| :--- | :--- | :--- |
| **背景色** | `White` (`#FFFFFF`) | |
| **文字颜色** | `Primary` (`#4A90E2`) | |
| **边框** | `1px solid` `Primary` (`#4A90E2`) | |
| **其他属性** | 同主按钮 (内边距, 圆角, 字体等) | |

**状态 (States):**
*   **悬浮 (Hover)**:
    *   背景色: `Primary` (`#4A90E2`) 的极浅版 `rgba(74, 144, 226, 0.05)`
*   **禁用 (Disabled)**:
    *   背景色: `White`
    *   文字颜色: `Subtle Text` 的半透明版 `rgba(113, 128, 150, 0.5)`
    *   边框颜色: `Border / Divider` (`#E2E8F0`)

#### 4.1.3. 文本按钮 (Text Button)

用于最低优先级的操作，或需要融入文本流中的操作，如“了解更多”。

| 属性 | 值 | 备注 |
| :--- | :--- | :--- |
| **背景色** | `transparent` (透明) | |
| **文字颜色** | `Primary` (`#4A90E2`) | |
| **其他属性** | 无边框，无阴影 | |

**状态 (States):**
*   **悬浮 (Hover)**:
    *   文字增加下划线: `text-decoration: underline`

---

### 4.2. 商品卡片 (Product Card)

商品卡片是 DeMart 视觉传达的核心，用于在网格布局中吸引用户并展示商品概览。

| 属性 | 值 | 备注 |
| :--- | :--- | :--- |
| **背景色** | `White` (`#FFFFFF`) | |
| **宽度 (Width)** | `~280px` (示例) | 具体宽度将由网格布局决定，以实现响应式 |
| **圆角 (Border-radius)**| `1rem` (16px) | 较大的圆角，营造亲和感 |
| **边框 (Border)** | `1px solid` `Border / Divider` (`#E2E8F0`) | |
| **阴影 (Box-shadow)** | `0 4px 6px -1px rgba(74, 144, 226, 0.05)` | 使用主色的极淡版本作为阴影，更具品牌感 |
| **过渡 (Transition)** | `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | 平滑的动画效果 |
| **布局 (Layout)** | Flexbox (column) | 内部元素垂直排列 |

#### 组件构成:

1.  **图片区 (Image Area)**
    *   **高度**: `~200px` (示例)
    *   **图片样式**: `object-fit: cover`，确保图片填满区域而不变形。
    *   **圆角**: 仅上半部分有圆角，与卡片顶部对齐。`border-top-left-radius: 16px; border-top-right-radius: 16px;`

2.  **内容区 (Content Area)**
    *   **内边距 (Padding)**: `1rem` (16px)
    *   **商品标题 (Title)**:
        *   字体样式: `H4 / 小节标题` (`16px`, `Semi-Bold`)
        *   颜色: `Rich Black` (`#1A202C`)
        *   **截断处理**: 最多显示两行，超出部分用 `...` 表示。
    *   **价格 (Price)**:
        *   字体样式: `Body (Bold)` (`16px`, `Bold`)
        *   颜色: `Primary` (`#4A90E2`)
    *   **卖家信息 (Seller Info)**:
        *   布局: `Flexbox` (row), `align-items: center`
        *   **头像**: `24px x 24px`, 圆形
        *   **昵称**: 字体样式 `Caption` (`14px`, `Regular`)，颜色 `Subtle Text` (`#718096`)
        *   **间距**: 头像和昵称之间有 `8px` 的间距。

#### 状态 (States):

*   **悬浮 (Hover)**:
    *   **transform**: `translateY(-4px)`，卡片轻微上移。
    *   **阴影增强**: `box-shadow: 0 12px 20px -4px rgba(74, 144, 226, 0.2)`
    *   **边框高亮**: `border-color: Primary` (`#4A90E2`)
    *   鼠标指针: `cursor: pointer`
*   **点击 (Active)**:
    *   **transform**: `translateY(-2px)`，上移效果减弱。
    *   **阴影减弱**: 悬浮阴影的更弱版本。

---

### 4.3. 输入框 (Input) 与 文本域 (Textarea)

表单元素是用户与平台进行数据交换的核心，其设计的清晰度和易用性至关重要。

| 属性 | 值 | 备注 |
| :--- | :--- | :--- |
| **背景色** | `White` (`#FFFFFF`) | |
| **文字颜色** | `Body Text` (`#4A5568`) | |
| **字体** | `Body` (`16px`, `Regular`) | |
| **内边距 (Padding)** | `0.75rem 1rem` (12px 16px) | |
| **圆角 (Border-radius)**| `0.5rem` (8px) | 与按钮圆角保持一致 |
| **边框 (Border)** | `1px solid` `Border / Divider` (`#E2E8F0`) | |
| **过渡 (Transition)** | `all 0.2s ease-in-out` | |

#### 占位符 (Placeholder)
*   **颜色**: `Subtle Text` (`#718096`)

#### 标签 (Label)
*   位于输入框上方。
*   **字体样式**: `Caption` (`14px`, `Regular`)，但字重为 `Medium`。
*   **颜色**: `Body Text` (`#4A5568`)
*   **与输入框间距**: `0.5rem` (8px)

#### 状态 (States):

*   **悬浮 (Hover)**:
    *   边框颜色: `Primary` 的浅色版 `rgba(74, 144, 226, 0.5)`
*   **聚焦 (Focus)**:
    *   边框颜色: `Primary` (`#4A90E2`)
    *   **阴影**: `box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2)`，创建辉光效果。
*   **错误 (Error)**:
    *   边框颜色: `Error` (`#E53E3E`)
    *   **阴影**: `box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2)`
    *   **错误提示信息**: 输入框下方会显示红色的辅助文字，说明错误原因。
*   **禁用 (Disabled)**:
    *   背景色: `Light Background` (`#F7FAFC`)
    *   文字颜色: `Subtle Text` (`#718096`)
    *   鼠标指针: `cursor: not-allowed`

#### 文本域 (Textarea)
*   继承所有 `Input` 的样式和状态。
*   **额外属性**:
    *   `resize: vertical`，允许用户垂直调整其高度。
    *   **最小高度 (min-height)**: `120px`。 
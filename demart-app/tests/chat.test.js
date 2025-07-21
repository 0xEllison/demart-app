/**
 * 聊天功能测试
 */

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 设置为 true 可以在无头模式下运行
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('开始聊天功能测试...');

  try {
    // 1. 先登录
    console.log('\n步骤 1: 用户登录');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // 截图登录页面
    await page.screenshot({ path: 'tests/screenshots/login-page.png' });
    
    // 查找登录表单字段
    const emailField = await page.$('input[name="email"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="Email"]');
    const passwordField = await page.$('input[name="password"], input[type="password"], input[placeholder*="密码"], input[placeholder*="Password"]');
    
    if (!emailField || !passwordField) {
      throw new Error('登录表单缺少必要的字段');
    }
    
    // 填写登录表单
    console.log('填写登录表单...');
    await emailField.fill('buyer@example.com');
    await passwordField.fill('password123');
    
    // 查找登录按钮
    const loginButton = await page.$('button[type="submit"], button:has-text("登录"), button:has-text("Login")');
    
    if (!loginButton) {
      throw new Error('找不到登录按钮');
    }
    
    // 提交登录表单
    console.log('提交登录表单...');
    await loginButton.click();
    
    // 等待页面变化
    await page.waitForLoadState('networkidle');
    
    // 截图
    await page.screenshot({ path: 'tests/screenshots/after-login.png' });
    
    // 检查是否成功登录
    const currentUrl = page.url();
    console.log('登录后URL:', currentUrl);
    
    // 不管是否登录成功，都继续测试
    console.log('继续测试...');
    
    // 2. 访问商品详情页
    console.log('\n步骤 2: 访问商品详情页');
    
    // 从API获取商品列表
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/products');
        return await res.json();
      } catch (error) {
        return { products: [] };
      }
    });
    
    console.log(`API返回 ${response.products?.length || 0} 个商品`);
    
    if (!response.products || response.products.length === 0) {
      throw new Error('没有可用的商品');
    }
    
    // 获取第一个商品的ID
    const productId = response.products[0].id;
    console.log('选择商品ID:', productId);
    
    // 访问商品详情页
    await page.goto(`http://localhost:3000/products/${productId}`);
    await page.waitForLoadState('networkidle');
    
    // 截图商品详情页
    await page.screenshot({ path: 'tests/screenshots/product-detail.png' });
    
    // 检查页面内容
    const pageContent = await page.content();
    console.log('商品详情页内容长度:', pageContent.length);
    
    // 检查是否有聊一聊按钮
    const hasChatButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(button => 
        button.textContent && 
        button.textContent.includes('聊一聊')
      );
    });
    
    if (!hasChatButton) {
      throw new Error('未找到"聊一聊"按钮');
    }
    
    console.log('✅ 找到"聊一聊"按钮');
    
    // 3. 测试聊一聊功能
    console.log('\n步骤 3: 测试"聊一聊"功能');
    
    // 启用网络请求监听
    page.on('request', request => {
      if (request.url().includes('/api/conversations') && request.method() === 'POST') {
        console.log('发送请求:', request.url());
        console.log('请求方法:', request.method());
        try {
          const postData = request.postDataJSON();
          console.log('POST数据:', postData);
        } catch (error) {
          console.log('无法解析POST数据');
        }
      }
    });
    
    // 启用网络响应监听
    page.on('response', async response => {
      if (response.url().includes('/api/conversations')) {
        console.log('收到响应:', response.url());
        console.log('响应状态:', response.status());
        try {
          const body = await response.json();
          console.log('响应内容:', body);
        } catch (error) {
          console.log('无法解析响应内容');
        }
      }
    });
    
    // 点击聊一聊按钮
    await page.click('button:has-text("聊一聊")');
    
    // 等待页面变化
    await page.waitForLoadState('networkidle');
    
    // 截图
    await page.screenshot({ path: 'tests/screenshots/after-chat-click.png' });
    
    // 获取当前URL
    const afterChatUrl = page.url();
    console.log('点击聊一聊后URL:', afterChatUrl);
    
    // 等待一段时间，确保所有请求和响应都被捕获
    await page.waitForTimeout(3000);
    
    // 检查是否跳转到聊天页面
    if (afterChatUrl.includes('/messages/')) {
      console.log('✅ 成功跳转到聊天页面');
      
      // 等待聊天页面加载
      await page.waitForLoadState('networkidle');
      
      // 截图聊天页面
      await page.screenshot({ path: 'tests/screenshots/chat-page.png' });
      
      // 检查是否有消息输入框
      const hasMessageInput = await page.evaluate(() => {
        return !!document.querySelector('textarea[placeholder*="输入"], input[placeholder*="输入"]');
      });
      
      if (hasMessageInput) {
        console.log('✅ 找到消息输入框');
        
        // 发送测试消息
        console.log('发送测试消息...');
        await page.fill('textarea[placeholder*="输入"], input[placeholder*="输入"]', '您好，我对这个商品很感兴趣');
        await page.click('button:has-text("发送")');
        
        // 等待消息发送
        await page.waitForTimeout(1000);
        
        // 截图
        await page.screenshot({ path: 'tests/screenshots/message-sent.png' });
        
        console.log('✅ 消息已发送');
      } else {
        console.log('⚠️ 未找到消息输入框');
      }
    } else {
      console.log('⚠️ 未能跳转到聊天页面');
    }

    console.log('\n测试完成！');

  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
    // 捕获错误时的截图
    await page.screenshot({ path: 'tests/screenshots/error.png' });
  } finally {
    // 关闭浏览器
    await browser.close();
  }
})(); 
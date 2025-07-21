/**
 * 商品浏览和聊天功能测试
 */

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 设置为 true 可以在无头模式下运行
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('开始商品浏览和聊天功能测试...');

  try {
    // 1. 先登录
    console.log('\n步骤 1: 用户登录');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // 填写登录表单 (使用种子脚本创建的测试用户)
    await page.fill('input[name="email"]', 'buyer@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 等待重定向到首页
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ 成功登录');

    // 2. 浏览商品列表
    console.log('\n步骤 2: 浏览商品列表');
    // 等待商品加载
    await page.waitForSelector('.grid > div', { timeout: 10000 });
    const productCount = await page.$$eval('.grid > div', (items) => items.length);
    console.log(`✅ 成功加载商品列表，共 ${productCount} 个商品`);

    // 截图
    await page.screenshot({ path: 'tests/screenshots/product-list.png' });

    // 3. 查看商品详情
    console.log('\n步骤 3: 查看商品详情');
    // 点击第一个商品
    await page.click('.grid > div:first-child');
    // 等待商品详情页面加载
    await page.waitForSelector('h1.text-3xl', { timeout: 10000 });
    const productTitle = await page.$eval('h1.text-3xl', (el) => el.textContent);
    console.log(`✅ 成功加载商品详情页，商品标题: ${productTitle}`);

    // 截图
    await page.screenshot({ path: 'tests/screenshots/product-detail.png' });

    // 4. 点击聊一聊
    console.log('\n步骤 4: 测试聊一聊功能');
    // 点击聊一聊按钮
    await page.click('text=聊一聊');
    
    // 等待跳转到聊天页面
    try {
      await page.waitForURL('**/messages/**', { timeout: 10000 });
      console.log('✅ 成功跳转到聊天页面');
      
      // 截图
      await page.screenshot({ path: 'tests/screenshots/chat-page.png' });

      // 5. 发送消息
      console.log('\n步骤 5: 发送消息');
      await page.waitForSelector('textarea[placeholder="输入消息..."]', { timeout: 5000 });
      await page.fill('textarea[placeholder="输入消息..."]', '您好，我对这个商品很感兴趣');
      await page.click('button:has-text("发送")');
      
      // 等待消息显示
      await page.waitForSelector('text=您好，我对这个商品很感兴趣', { timeout: 10000 });
      console.log('✅ 成功发送消息');

      // 截图
      await page.screenshot({ path: 'tests/screenshots/message-sent.png' });
    } catch (error) {
      console.error(`❌ 聊天功能测试失败: ${error.message}`);
      await page.screenshot({ path: 'tests/screenshots/chat-error.png' });
    }

    // 6. 测试浏览历史
    console.log('\n步骤 6: 测试浏览历史');
    // 返回首页
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 查找浏览历史链接
    const hasHistoryLink = await page.$$eval('a', (links) => 
      links.some(link => link.textContent.includes('浏览历史'))
    );
    
    if (hasHistoryLink) {
      // 点击浏览历史链接
      await page.click('text=浏览历史');
      // 等待浏览历史页面加载
      await page.waitForURL('**/browse-history', { timeout: 10000 });
      
      // 检查是否有浏览记录
      const historyItems = await page.$$eval('.grid > div', (items) => items.length);
      console.log(`✅ 成功加载浏览历史，共 ${historyItems} 条记录`);

      // 截图
      await page.screenshot({ path: 'tests/screenshots/browse-history.png' });
    } else {
      console.log('⚠️ 未找到浏览历史链接，跳过此测试');
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
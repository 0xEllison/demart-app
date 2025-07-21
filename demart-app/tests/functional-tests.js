/**
 * DeMart 应用功能测试脚本
 * 
 * 本脚本使用 Playwright 进行端到端功能测试，测试以下功能：
 * 1. 用户注册和登录
 * 2. 浏览商品列表
 * 3. 查看商品详情
 * 4. 聊天功能
 * 5. 浏览历史
 */

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 设置为 true 可以在无头模式下运行
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('开始功能测试...');

  try {
    // 测试 1: 访问首页
    console.log('\n测试 1: 访问首页');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ 成功加载首页');

    // 截图
    await page.screenshot({ path: 'tests/screenshots/homepage.png' });

    // 测试 2: 注册新用户
    console.log('\n测试 2: 注册新用户');
    await page.click('text=立即注册');
    await page.waitForURL('**/register');
    
    // 生成随机邮箱以避免重复
    const randomEmail = `test${Date.now()}@example.com`;
    await page.fill('input[name="name"]', '测试用户');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 等待重定向到登录页面
    await page.waitForURL('**/login?registered=true', { timeout: 10000 });
    console.log('✅ 成功注册新用户');

    // 测试 3: 登录
    console.log('\n测试 3: 登录');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 等待重定向到首页
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ 成功登录');

    // 测试 4: 浏览商品列表
    console.log('\n测试 4: 浏览商品列表');
    // 等待商品加载
    await page.waitForSelector('.grid > div', { timeout: 10000 });
    const productCount = await page.$$eval('.grid > div', (items) => items.length);
    console.log(`✅ 成功加载商品列表，共 ${productCount} 个商品`);

    // 测试 5: 查看商品详情
    console.log('\n测试 5: 查看商品详情');
    // 点击第一个商品
    await page.click('.grid > div:first-child');
    // 等待商品详情页面加载
    await page.waitForSelector('h1.text-3xl', { timeout: 10000 });
    const productTitle = await page.$eval('h1.text-3xl', (el) => el.textContent);
    console.log(`✅ 成功加载商品详情页，商品标题: ${productTitle}`);

    // 截图
    await page.screenshot({ path: 'tests/screenshots/product-detail.png' });

    // 测试 6: 聊一聊功能
    console.log('\n测试 6: 聊一聊功能');
    // 点击聊一聊按钮
    await page.click('text=聊一聊');
    // 等待跳转到聊天页面
    await page.waitForURL('**/messages/**', { timeout: 10000 });
    console.log('✅ 成功跳转到聊天页面');

    // 测试 7: 发送消息
    console.log('\n测试 7: 发送消息');
    await page.fill('textarea[placeholder="输入消息..."]', '您好，我对这个商品很感兴趣');
    await page.click('button:has-text("发送")');
    
    // 等待消息显示
    await page.waitForSelector('text=您好，我对这个商品很感兴趣', { timeout: 10000 });
    console.log('✅ 成功发送消息');

    // 截图
    await page.screenshot({ path: 'tests/screenshots/chat.png' });

    // 测试 8: 浏览历史
    console.log('\n测试 8: 浏览历史');
    // 返回首页
    await page.goto('http://localhost:3000');
    // 点击浏览历史链接
    await page.click('text=浏览历史');
    // 等待浏览历史页面加载
    await page.waitForURL('**/browse-history', { timeout: 10000 });
    
    // 检查是否有浏览记录
    const historyItems = await page.$$eval('.grid > div', (items) => items.length);
    console.log(`✅ 成功加载浏览历史，共 ${historyItems} 条记录`);

    // 截图
    await page.screenshot({ path: 'tests/screenshots/browse-history.png' });

    console.log('\n所有测试完成！');

  } catch (error) {
    console.error(`❌ 测试失败: ${error.message}`);
    // 捕获错误时的截图
    await page.screenshot({ path: 'tests/screenshots/error.png' });
  } finally {
    // 关闭浏览器
    await browser.close();
  }
})(); 
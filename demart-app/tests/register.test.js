/**
 * 用户注册功能测试
 */

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 设置为 true 可以在无头模式下运行
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('开始用户注册测试...');

  try {
    // 访问首页
    console.log('正在访问首页...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ 成功加载首页');

    // 检查是否有登录按钮
    const hasLoginButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.some(button => 
        button.textContent && 
        (button.textContent.includes('登录') || 
         button.textContent.includes('Login'))
      );
    });

    if (hasLoginButton) {
      console.log('找到登录按钮，点击进入登录页面');
      await page.click('text=登录', { timeout: 5000 }).catch(() => {
        console.log('尝试点击 Login 按钮');
        return page.click('text=Login', { timeout: 5000 });
      });
    } else {
      console.log('未找到登录按钮，直接访问登录页面');
      await page.goto('http://localhost:3000/login');
    }
    
    await page.waitForLoadState('networkidle');
    
    // 检查是否有注册链接
    const hasRegisterLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(link => 
        link.textContent && 
        (link.textContent.includes('注册') || 
         link.textContent.includes('Register'))
      );
    });

    if (hasRegisterLink) {
      console.log('找到注册链接，点击进入注册页面');
      await page.click('text=注册', { timeout: 5000 }).catch(() => {
        console.log('尝试点击 Register 链接');
        return page.click('text=Register', { timeout: 5000 });
      });
    } else {
      console.log('未找到注册链接，直接访问注册页面');
      await page.goto('http://localhost:3000/register');
    }
    
    await page.waitForLoadState('networkidle');
    console.log('✅ 成功导航到注册页面');
    
    // 截图注册页面
    await page.screenshot({ path: 'tests/screenshots/register-page.png' });
    
    // 检查页面上是否有注册表单
    const hasForm = await page.evaluate(() => {
      return !!document.querySelector('form');
    });
    
    if (!hasForm) {
      throw new Error('注册页面上没有找到表单');
    }
    
    // 查找表单字段
    const nameField = await page.$('input[name="name"], input[placeholder*="姓名"], input[placeholder*="Name"]');
    const emailField = await page.$('input[name="email"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="Email"]');
    const passwordField = await page.$('input[name="password"], input[type="password"], input[placeholder*="密码"], input[placeholder*="Password"]');
    
    if (!nameField || !emailField || !passwordField) {
      throw new Error('注册表单缺少必要的字段');
    }
    
    // 生成随机邮箱以避免重复
    const randomEmail = `test${Date.now()}@example.com`;
    
    // 填写注册表单
    console.log('填写注册表单...');
    await nameField.fill('测试用户');
    await emailField.fill(randomEmail);
    await passwordField.fill('password123');
    
    // 查找提交按钮
    const submitButton = await page.$('button[type="submit"], button:has-text("注册"), button:has-text("Register")');
    
    if (!submitButton) {
      throw new Error('找不到提交按钮');
    }
    
    // 提交表单
    console.log('提交注册表单...');
    await submitButton.click();
    
    // 等待页面变化
    await page.waitForLoadState('networkidle');
    
    // 截图
    await page.screenshot({ path: 'tests/screenshots/after-register.png' });
    console.log('✅ 注册表单已提交');

    // 尝试登录
    console.log('\n开始用户登录测试...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // 查找登录表单字段
    const loginEmailField = await page.$('input[name="email"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="Email"]');
    const loginPasswordField = await page.$('input[name="password"], input[type="password"], input[placeholder*="密码"], input[placeholder*="Password"]');
    
    if (!loginEmailField || !loginPasswordField) {
      throw new Error('登录表单缺少必要的字段');
    }
    
    // 填写登录表单
    console.log('填写登录表单...');
    await loginEmailField.fill(randomEmail);
    await loginPasswordField.fill('password123');
    
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
    if (currentUrl.includes('http://localhost:3000/login')) {
      console.log('⚠️ 登录可能失败，尝试使用种子数据中的用户登录');
      
      await loginEmailField.fill('buyer@example.com');
      await loginPasswordField.fill('password123');
      await loginButton.click();
      
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/seed-user-login.png' });
    }
    
    console.log('✅ 登录过程完成');

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
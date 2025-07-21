/**
 * 首页和商品列表功能测试
 */

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 设置为 true 可以在无头模式下运行
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('开始首页和商品列表测试...');

  try {
    // 访问首页
    console.log('正在访问首页...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ 成功加载首页');

    // 截图首页
    await page.screenshot({ path: 'tests/screenshots/homepage.png' });

    // 检查页面内容
    const pageContent = await page.content();
    console.log('页面内容长度:', pageContent.length);

    // 检查是否有错误信息
    const hasError = await page.evaluate(() => {
      return document.body.textContent.includes('获取商品信息失败');
    });

    if (hasError) {
      console.log('⚠️ 页面显示错误: 获取商品信息失败');
    }

    // 检查网络请求
    console.log('检查商品API请求...');
    const [request] = await Promise.all([
      page.waitForRequest(request => request.url().includes('/api/products'), { timeout: 5000 }).catch(() => null),
      page.reload()
    ]);

    if (request) {
      console.log('✅ 检测到商品API请求:', request.url());
    } else {
      console.log('⚠️ 未检测到商品API请求');
    }

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 手动检查商品列表
    console.log('手动检查商品列表...');
    const productElements = await page.$$('.grid > div');
    console.log(`找到 ${productElements.length} 个可能的商品元素`);

    // 检查页面上的所有链接
    const links = await page.$$eval('a', links => links.map(link => {
      return {
        href: link.href,
        text: link.textContent.trim()
      };
    }));
    
    const productLinks = links.filter(link => link.href.includes('/products/'));
    console.log(`找到 ${productLinks.length} 个商品链接`);

    if (productLinks.length > 0) {
      console.log('商品链接示例:', productLinks[0]);
      
      // 直接访问第一个商品链接
      console.log('访问第一个商品链接...');
      await page.goto(productLinks[0].href);
      
      // 等待页面变化
      await page.waitForLoadState('networkidle');
      
      // 截图商品详情页
      await page.screenshot({ path: 'tests/screenshots/product-detail.png' });
      
      // 获取当前URL
      const currentUrl = page.url();
      console.log('当前URL:', currentUrl);
      
      if (currentUrl.includes('/products/')) {
        console.log('✅ 成功导航到商品详情页');
        
        // 获取商品标题
        const productTitle = await page.evaluate(() => {
          const heading = document.querySelector('h1, h2');
          return heading ? heading.textContent.trim() : '未找到标题';
        });
        
        console.log(`✅ 商品标题: ${productTitle}`);

        // 检查"聊一聊"按钮
        const hasChatButton = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.some(button => 
            button.textContent && 
            button.textContent.includes('聊一聊')
          );
        });
        
        if (hasChatButton) {
          console.log('✅ 找到"聊一聊"按钮');
          
          // 测试聊一聊功能
          console.log('测试"聊一聊"功能...');
          try {
            // 点击聊一聊按钮
            await page.click('button:has-text("聊一聊")');
            
            // 等待页面变化
            await page.waitForLoadState('networkidle');
            
            // 截图
            await page.screenshot({ path: 'tests/screenshots/chat-page.png' });
            
            // 检查是否跳转到聊天页面
            const chatUrl = page.url();
            console.log('聊天页面URL:', chatUrl);
            
            if (chatUrl.includes('/messages/')) {
              console.log('✅ 成功跳转到聊天页面');
            } else {
              console.log('⚠️ 未能跳转到聊天页面');
            }
          } catch (error) {
            console.error(`❌ 聊一聊功能测试失败: ${error.message}`);
            await page.screenshot({ path: 'tests/screenshots/chat-error.png' });
          }
        } else {
          console.log('⚠️ 未找到"聊一聊"按钮');
        }
      } else {
        console.log('⚠️ 未能导航到商品详情页');
      }
    } else {
      console.log('⚠️ 未找到商品链接');
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
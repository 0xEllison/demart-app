/**
 * 浏览历史功能测试
 */

const { chromium } = require('playwright');

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({
    headless: false, // 设置为 true 可以在无头模式下运行
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('开始浏览历史功能测试...');

  try {
    // 1. 访问首页
    console.log('\n步骤 1: 访问首页');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ 成功加载首页');

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
    
    // 访问多个商品详情页，以创建浏览历史
    for (let i = 0; i < Math.min(3, response.products.length); i++) {
      const product = response.products[i];
      console.log(`访问商品 ${i+1}: ${product.title}`);
      
      // 访问商品详情页
      await page.goto(`http://localhost:3000/products/${product.id}`);
      await page.waitForLoadState('networkidle');
      
      // 等待一段时间，确保浏览历史被记录
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ 成功访问多个商品详情页');

    // 3. 访问浏览历史页面
    console.log('\n步骤 3: 访问浏览历史页面');
    
    // 检查浏览历史是否存储在localStorage中
    const browseHistory = await page.evaluate(() => {
      return localStorage.getItem('browseHistory');
    });
    
    if (browseHistory) {
      console.log('✅ 找到浏览历史数据:', browseHistory.substring(0, 100) + '...');
    } else {
      console.log('⚠️ 未找到浏览历史数据');
    }
    
    // 访问浏览历史页面
    await page.goto('http://localhost:3000/browse-history');
    await page.waitForLoadState('networkidle');
    
    // 截图浏览历史页面
    await page.screenshot({ path: 'tests/screenshots/browse-history.png' });
    
    // 检查是否有浏览历史记录
    const historyItems = await page.$$('.grid > div');
    console.log(`找到 ${historyItems.length} 条浏览历史记录`);
    
    if (historyItems.length > 0) {
      console.log('✅ 成功显示浏览历史');
      
      // 测试删除单条浏览历史
      console.log('\n步骤 4: 测试删除单条浏览历史');
      
      // 检查是否有删除按钮
      const hasDeleteButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(button => 
          button.textContent && 
          (button.textContent.includes('删除') || button.textContent.includes('移除'))
        );
      });
      
      if (hasDeleteButton) {
        console.log('找到删除按钮，点击删除第一条记录');
        
        // 点击第一个删除按钮
        await page.click('button:has-text("删除"), button:has-text("移除")');
        
        // 等待一段时间
        await page.waitForTimeout(1000);
        
        // 检查记录是否减少
        const newHistoryItems = await page.$$('.grid > div');
        console.log(`删除后剩余 ${newHistoryItems.length} 条浏览历史记录`);
        
        if (newHistoryItems.length < historyItems.length) {
          console.log('✅ 成功删除单条浏览历史');
        } else {
          console.log('⚠️ 删除单条浏览历史失败');
        }
      } else {
        console.log('⚠️ 未找到删除按钮');
      }
      
      // 测试清空浏览历史
      console.log('\n步骤 5: 测试清空浏览历史');
      
      // 检查是否有清空按钮
      const hasClearButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(button => 
          button.textContent && 
          (button.textContent.includes('清空') || button.textContent.includes('全部删除'))
        );
      });
      
      if (hasClearButton) {
        console.log('找到清空按钮，点击清空所有记录');
        
        // 点击清空按钮
        await page.click('button:has-text("清空"), button:has-text("全部删除")');
        
        // 等待一段时间
        await page.waitForTimeout(1000);
        
        // 检查是否有确认对话框
        const hasConfirmDialog = await page.evaluate(() => {
          return document.body.textContent.includes('确认') || 
                 document.body.textContent.includes('确定');
        });
        
        if (hasConfirmDialog) {
          console.log('找到确认对话框，点击确认');
          await page.click('button:has-text("确认"), button:has-text("确定")');
          await page.waitForTimeout(1000);
        }
        
        // 检查记录是否被清空
        const afterClearItems = await page.$$('.grid > div');
        console.log(`清空后剩余 ${afterClearItems.length} 条浏览历史记录`);
        
        if (afterClearItems.length === 0) {
          console.log('✅ 成功清空浏览历史');
        } else {
          console.log('⚠️ 清空浏览历史失败');
        }
      } else {
        console.log('⚠️ 未找到清空按钮');
      }
    } else {
      console.log('⚠️ 未找到浏览历史记录');
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
/**
 * DeMart 应用功能测试运行脚本
 * 
 * 使用方法：
 * node tests/run-tests.js [test-name]
 * 
 * 参数：
 * test-name - 可选，指定要运行的测试名称，不指定则运行所有测试
 * 
 * 可用的测试：
 * - homepage: 首页和商品列表测试
 * - browse-history: 浏览历史功能测试
 * - chat: 聊天功能测试
 * - register: 注册功能测试
 * - all: 运行所有测试
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const tests = {
  'homepage': {
    file: 'homepage.test.js',
    description: '首页和商品列表测试'
  },
  'browse-history': {
    file: 'browse-history.test.js',
    description: '浏览历史功能测试'
  },
  'chat': {
    file: 'chat.test.js',
    description: '聊天功能测试'
  },
  'register': {
    file: 'register.test.js',
    description: '注册功能测试'
  }
};

// 创建测试结果目录
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// 创建截图目录
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// 获取命令行参数
const args = process.argv.slice(2);
const testToRun = args[0] || 'all';

// 运行测试
async function runTest(testName) {
  const test = tests[testName];
  if (!test) {
    console.error(`未知的测试: ${testName}`);
    return false;
  }

  console.log(`\n======== 运行 ${test.description} ========\n`);
  
  const testFile = path.join(__dirname, test.file);
  if (!fs.existsSync(testFile)) {
    console.error(`测试文件不存在: ${testFile}`);
    return false;
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    const testProcess = spawn('node', [testFile]);
    
    // 创建日志文件
    const logFile = path.join(resultsDir, `${testName}-${Date.now()}.log`);
    const logStream = fs.createWriteStream(logFile);
    
    // 输出到控制台和日志文件
    testProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
      logStream.write(data);
    });
    
    testProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
      logStream.write(data);
    });
    
    testProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      const result = code === 0 ? '✅ 通过' : '❌ 失败';
      const summary = `${result} (耗时: ${duration.toFixed(2)}秒, 退出码: ${code})`;
      
      console.log(`\n${test.description} 完成: ${summary}\n`);
      logStream.write(`\n${summary}\n`);
      logStream.end();
      
      resolve(code === 0);
    });
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('\n======== DeMart 应用功能测试 ========\n');
  
  const results = {};
  let allPassed = true;
  
  for (const testName of Object.keys(tests)) {
    const passed = await runTest(testName);
    results[testName] = passed;
    if (!passed) allPassed = false;
  }
  
  console.log('\n======== 测试结果摘要 ========\n');
  for (const [testName, passed] of Object.entries(results)) {
    const test = tests[testName];
    console.log(`${passed ? '✅' : '❌'} ${test.description}`);
  }
  
  console.log(`\n总体结果: ${allPassed ? '✅ 全部通过' : '❌ 部分失败'}\n`);
  
  return allPassed;
}

// 主函数
async function main() {
  if (testToRun === 'all') {
    await runAllTests();
  } else {
    await runTest(testToRun);
  }
}

// 运行测试
main().catch(error => {
  console.error('测试运行出错:', error);
  process.exit(1);
}); 
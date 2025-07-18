#!/usr/bin/env node

/**
 * 自动测试运行器
 * 
 * 此脚本用于监视文件更改并自动运行测试
 * 使用方法: node test-runner.js [--watch]
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { argv } = require('process');

// 配置
const watchMode = argv.includes('--watch');
const testCommand = 'npm';
const testArgs = ['test'];

// 如果指定了 --watch 参数，则添加 --watchAll 参数
if (watchMode) {
  testArgs.push('--', '--watchAll');
}

// 运行测试
function runTests() {
  console.log('\n🧪 运行测试...');
  
  const testProcess = spawn(testCommand, testArgs, { stdio: 'inherit' });
  
  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 测试通过!');
    } else {
      console.log(`❌ 测试失败，退出代码: ${code}`);
    }
    
    if (!watchMode) {
      // 如果不是监视模式，则在测试完成后退出
      process.exit(code);
    } else {
      console.log('\n👀 监视文件更改...');
    }
  });
}

// 在监视模式下监视文件更改
if (watchMode) {
  console.log('👀 监视文件更改...');
  
  // 在这里，我们不需要手动监视文件，因为 Jest 的 --watchAll 参数会处理这个
  runTests();
} else {
  // 如果不是监视模式，则直接运行测试
  runTests();
} 
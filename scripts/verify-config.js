#!/usr/bin/env node

/**
 * 配置验证脚本
 * 检查所有必需的环境变量是否正确设置
 */

const fs = require('fs');
const path = require('path');

// 必需的环境变量
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

// AI服务相关
const aiEnvVars = [
  'OPENAI_API_KEY',
  'TOGETHER_AI_API_KEY'
];

// 其他服务
const optionalEnvVars = [
  'DATABASE_URL',
  'UPLOADTHING_TOKEN',
  'UNSPLASH_ACCESS_KEY',
  'TAVILY_API_KEY'
];

console.log('🔍 Presentation AI 配置验证\n');

// 检查 .env.local 文件是否存在
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local 文件不存在！');
  console.log('请创建 .env.local 文件并添加所需的环境变量。');
  process.exit(1);
}

console.log('✅ .env.local 文件存在\n');

// 读取并解析环境变量
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...values] = trimmedLine.split('=');
    if (key && values.length > 0) {
      envVars[key] = values.join('=').replace(/"/g, '');
    }
  }
});

// 检查必需的环境变量
console.log('🔐 检查认证相关配置:');
let hasError = false;

requiredEnvVars.forEach(varName => {
  const value = envVars[varName];
  if (!value || value === 'your-google-client-id' || value === 'your-google-client-secret') {
    console.error(`❌ ${varName}: 未设置或使用占位符值`);
    hasError = true;
  } else if (varName === 'GOOGLE_CLIENT_ID' && !value.includes('googleusercontent.com')) {
    console.warn(`⚠️  ${varName}: 可能不是有效的Google客户端ID`);
  } else if (varName === 'GOOGLE_CLIENT_SECRET' && value.length < 10) {
    console.warn(`⚠️  ${varName}: 可能不是有效的Google客户端Secret`);
  } else {
    console.log(`✅ ${varName}: 已设置`);
  }
});

if (hasError) {
  console.log('\n❌ 认证配置存在问题，请检查Google OAuth配置！');
  process.exit(1);
}

console.log('\n🤖 检查AI服务配置:');
aiEnvVars.forEach(varName => {
  const value = envVars[varName];
  if (!value || value === `your-${varName.toLowerCase().replace('_', '-')}`) {
    console.warn(`⚠️  ${varName}: 未设置 (AI功能将无法使用)`);
  } else {
    console.log(`✅ ${varName}: 已设置`);
  }
});

console.log('\n📊 检查其他服务配置:');
optionalEnvVars.forEach(varName => {
  const value = envVars[varName];
  if (!value || value.includes('your-')) {
    console.warn(`⚠️  ${varName}: 未设置`);
  } else {
    console.log(`✅ ${varName}: 已设置`);
  }
});

console.log('\n🎯 配置摘要:');
console.log('- Google OAuth: ✅ 已配置，可以登录');
console.log('- AI服务: ' + (aiEnvVars.some(v => envVars[v] && !envVars[v].includes('your-')) ? '✅ 部分可用' : '⚠️  需要配置'));
console.log('- 数据库: ' + (envVars.DATABASE_URL && !envVars.DATABASE_URL.includes('username') ? '✅ 已配置' : '⚠️  需要配置'));

console.log('\n📝 下一步操作:');
console.log('1. 确保PostgreSQL数据库运行并更新 DATABASE_URL');
console.log('2. 获取OpenAI和Together AI的API密钥');
console.log('3. 运行以下命令启动项目:');
console.log('   npm install');
console.log('   npm run db:push');
console.log('   npm run dev');
console.log('\n4. 访问 http://localhost:3000 测试登录');

console.log('\n✨ 配置验证完成！');
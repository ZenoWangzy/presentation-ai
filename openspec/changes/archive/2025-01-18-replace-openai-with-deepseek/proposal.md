# Change: Replace OpenAI Interface with DeepSeek Interface

## Why
为了降低API调用成本并提高生成质量，需要将当前基于OpenAI的AI接口替换为DeepSeek API。DeepSeek提供了兼容OpenAI格式的API接口，支持流式调用，并且成本更低，性能更好。

## What Changes
- 替换AI模型提供商从OpenAI改为DeepSeek
- 修改model-picker.ts以支持DeepSeek API配置
- 更新环境变量配置以支持DeepSeek API密钥
- 确保流式响应功能与DeepSeek API兼容
- **BREAKING**: 需要配置DEEPSEEK_API_KEY环境变量替代OPENAI_API_KEY

## Impact
- **Affected specs**: ai-integration
- **Affected code**:
  - `src/lib/model-picker.ts:1-33` - 修改模型选择器支持DeepSeek
  - `src/app/api/presentation/generate/route.ts:295` - 更新模型调用
  - `src/app/api/presentation/outline/route.ts:96` - 更新模型调用
  - `src/env.js` - 添加DeepSeek API配置
  - `.env.example` - 更新环境变量示例
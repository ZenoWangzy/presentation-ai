## 1. 环境配置更新
- [x] 1.1 更新 `src/env.js` 添加 DEEPSEEK_API_KEY 环境变量
- [x] 1.2 更新 `.env.example` 包含新的环境变量配置
- [x] 1.3 验证环境变量加载和验证逻辑

## 2. 模型选择器修改
- [x] 2.1 修改 `src/lib/model-picker.ts` 支持DeepSeek提供商
- [x] 2.2 实现DeepSeek客户端初始化逻辑
- [x] 2.3 添加DeepSeek模型名称映射（deepseek-chat, deepseek-reasoner）
- [x] 2.4 实现优先级逻辑：DeepSeek > OpenAI > 其他

## 3. API路由更新
- [x] 3.1 更新 `src/app/api/presentation/generate/route.ts` 使用新的模型选择器
- [x] 3.2 更新 `src/app/api/presentation/outline/route.ts` 使用新的模型选择器
- [x] 3.3 更新 `src/app/api/presentation/outline-with-search/route.ts` 使用新的模型选择器
- [x] 3.4 验证所有API端点的流式响应功能

## 4. 组件更新
- [x] 4.1 更新 `src/components/presentation/dashboard/ModelPicker.tsx` UI组件
- [x] 4.2 添加DeepSeek选项到模型选择器
- [x] 4.3 更新默认模型选择逻辑

## 5. 错误处理和重试机制
- [x] 5.1 实现DeepSeek API调用的错误处理逻辑
- [x] 5.2 添加指数退避重试机制
- [x] 5.3 实现API调用失败的降级策略
- [x] 5.4 添加详细的错误日志记录

## 6. 测试和验证
- [x] 6.1 单元测试：测试model-picker.ts的DeepSeek集成
- [x] 6.2 集成测试：测试API端点的DeepSeek调用
- [x] 6.3 端到端测试：完整的演示文稿生成流程
- [x] 6.4 性能测试：对比OpenAI和DeepSeek的响应时间

## 7. 文档更新
- [x] 7.1 更新项目README中的AI服务配置说明
- [x] 7.2 更新环境变量配置文档
- [x] 7.3 添加DeepSeek API使用说明
- [x] 7.4 更新部署指南

## 8. 部署准备
- [x] 8.1 验证生产环境变量配置
- [x] 8.2 实施金丝雀部署策略
- [x] 8.3 监控API调用成功率和性能指标
- [x] 8.4 准备回滚计划
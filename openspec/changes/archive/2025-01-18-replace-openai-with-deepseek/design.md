# Design: DeepSeek Integration

## Context
当前系统使用OpenAI API进行演示文稿生成，包括大纲生成和幻灯片内容生成。为了降低成本并利用DeepSeek模型的优势，需要将AI服务提供商从OpenAI迁移到DeepSeek。

## Goals / Non-Goals
- Goals:
  - 完全替换OpenAI API为DeepSeek API
  - 保持现有功能不变（流式响应、多模型支持）
  - 维持向后兼容性，支持Ollama和LM Studio
  - 确保API调用成功率

- Non-Goals:
  - 修改AI生成逻辑和提示词
  - 更改响应数据格式
  - 修改用户界面

## Decisions

### Decision 1: 使用OpenAI SDK兼容模式
**Why**: DeepSeek API完全兼容OpenAI API格式，可以继续使用@ai-sdk/openai，只需修改baseURL和API key。

**Implementation**:
```typescript
const deepseek = createOpenAI({
  name: "deepseek",
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});
```

### Decision 2: 环境变量迁移策略
**Why**: 为了平滑迁移，同时支持OpenAI和DeepSeek API密钥，优先使用DeepSeek。

**Implementation**:
- 添加`DEEPSEEK_API_KEY`环境变量
- 保持`OPENAI_API_KEY`作为fallback
- 在model-picker中实现优先级逻辑

### Decision 3: 模型名称映射
**Why**: DeepSeek使用不同的模型名称，需要建立映射关系。

**Implementation**:
- `deepseek-chat` 替代 `gpt-4o-mini`
- `deepseek-reasoner` 用于复杂推理任务

## Risks / Trade-offs
- **Risk**: DeepSeek API稳定性未知 → Mitigation: 实现重试机制和错误处理
- **Risk**: 生成质量可能有所差异 → Mitigation: 保持现有提示词，可后续优化
- **Trade-off**: 成本降低 vs 可能的API延迟增加

## Migration Plan
1. 更新环境变量配置
2. 修改model-picker.ts支持DeepSeek
3. 更新所有API路由使用新的模型选择器
4. 测试所有AI功能（大纲生成、演示文稿生成）
5. 部署到生产环境
6. 监控API调用成功率和响应时间

## Open Questions
- 是否需要保留OpenAI作为备用选项？
- DeepSeek API的rate limits是否会影响用户体验？
- 如何处理API密钥轮换？
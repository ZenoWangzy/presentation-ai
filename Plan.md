# Generate Presentation 按钮无反应问题 - 调查与修复计划

**日期**: 2025-12-04  
**优先级**: 🔴 **极高** (核心功能完全阻塞)  
**状态**: 🔍 调查中

---

## 📋 问题描述

### 用户报告
- **页面**: `http://localhost:3000/presentation`
- **操作**: 输入 PPT 大纲内容 → 点击 "Generate Presentation" 按钮
- **预期**: 创建演示文稿并跳转到生成页面  
- **实际**: 按钮点击后无任何反应

### 浏览器测试发现

✅ **前端代码正常**:
- 按钮事件绑定: `onClick={handleGenerate}` ✓
- 键盘快捷键: `Ctrl+Enter` ✓  
- 前端逻辑: `handleGenerate` 函数完整 ✓
- Server Action 标记: `"use server"` ✓

🔴 **关键发现**:
- **浏览器控制台**: 多个 **500 Internal Server Error**
- **错误时机**: 点击按钮后立即出现
- **请求资源**: `/presentation`
- **结论**: 后端 Server Action 执行失败

---

## 🔍 问题分析

### 根本原因
后端 `createEmptyPresentation` Server Action 在执行时抛出 500 错误。

###  调用链路
```
用户点击按钮
  → handleGenerate() (前端)
    → createEmptyPresentation(title, theme, language)
      → createPresentation({content, title, theme, language})
        → ❌ 500 错误发生在这里
```

### 相关文件
- 前端: `src/components/presentation/dashboard/PresentationDashboard.tsx`
- Server Actions: `src/app/_actions/presentation/presentationActions.ts`

---

## 🎯 可能原因分析（按优先级）

### 1️⃣ 用户认证失败 ⭐️⭐️⭐️⭐️⭐️

**可能性**: 极高

**原因**:
```typescript
// src/app/_actions/presentation/presentationActions.ts:19-22
const session = await auth();
if (!session?.user) {
  throw new Error("Unauthorized");  // 👈 可能在这里抛出错误
}
```

**检查步骤**:
1. [ ] 确认用户是否已登录（检查浏览器 Session Cookie）
2. [ ] 查看 DevTools → Application → Cookies → 查找 `authjs.session-token` 或 `next-auth.session-token`
3. [ ] 查看终端日志中是否有 `Unauthorized` 错误
4. [ ] 测试登录功能是否正常

---

### 2️⃣ 数据库连接问题 ⭐️⭐️⭐️⭐️

**可能性**: 高

**原因**:
```typescript
// createPresentation 第45-66行
const presentation = await db.baseDocument.create({...})  // 👈 数据库操作可能失败
```

**环境配置**:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/presentation_ai"
```

**检查步骤**:
1. [ ] 确认 PostgreSQL 服务是否运行
   ```powershell
   # 检查 PostgreSQL 进程
   Get-Process postgres -ErrorAction SilentlyContinue
   ```
2. [ ] 测试数据库连接
   ```powershell
   npm run db:push
   # 或
   npx prisma db push
   ```
3. [ ] 查看终端日志中的数据库错误
4. [ ] 检查数据库是否存在：`presentation_ai`

---

### 3️⃣ Zod Schema 验证问题 ⭐️⭐️⭐️

**可能性**: 中等

**原因**:
```typescript
// createPresentation 第26-42行
const validationResult = CreatePresentationSchema.safeParse({
  title,
  slides: content.slides,
  theme,
});
```

虽然验证失败应该返回错误而不是抛出 500，但 Schema 定义可能有问题。

**检查步骤**:
1. [ ] 查看 `CreatePresentationSchema` 定义
2. [ ] 检查传入参数格式
3. [ ] 添加验证日志

---

### 4️⃣ Prisma Client 初始化问题 ⭐️⭐️

**可能性**: 低

**检查步骤**:
1. [ ] 确认 `@/server/db` 模块导出正确
2. [ ] 检查 Prisma Client 是否生成
   ```powershell
   npx prisma generate
   ```

---

## 🛠️ 调查步骤

### 第一步: 查看终端日志 (5分钟)

1. 定位运行 Next.js 开发服务器的终端
2. 清除终端历史记录（便于观察）
3. 重新点击 "Generate Presentation" 按钮
4. 立即查看终端输出的错误信息

**期望找到**:
- `Unauthorized` 错误 → 认证问题
- Prisma/PostgreSQL 错误 → 数据库问题
- 其他错误堆栈信息

---

### 第二步: 检查用户登录状态 (3分钟)

1. 打开浏览器 DevTools → Application → Cookies
2. 查找以下 Cookie:
   - `authjs.session-token`
   - `__Secure-authjs.session-token`
   - `next-auth.session-token`
3. 如果没有找到 → 用户未登录

**修复方案（如果未登录）**:
- 导航到登录页面
- 使用 Google OAuth 登录
- 重新测试

---

### 第三步: 检查数据库状态 (5分钟)

```powershell
# 1. 检查 PostgreSQL 服务
Get-Service postgresql* | Select-Object Name, Status

# 2. 测试数据库连接
cd d:\zeno\presentation-ai
npm run db:push

# 3. 如果失败，尝试启动数据库
# （具体命令取决于 PostgreSQL 安装方式）
```

---

### 第四步: 添加调试日志 (10分钟)

如果前面步骤未能定位问题，在代码中添加日志：

**修改文件**: `src/app/_actions/presentation/presentationActions.ts`

```typescript
export async function createPresentation({...}) {
  console.log('🔍 [createPresentation] 开始执行');
  
  const session = await auth();
  console.log('🔍 [createPresentation] Session:', session ? 'exists' : 'null');
  
  if (!session?.user) {
    console.error('❌ [createPresentation] 用户未登录');
    throw new Error("Unauthorized");
  }
  console.log('🔍 [createPresentation] User ID:', session.user.id);
  
  // ... 继续添加日志到关键步骤
}
```

---

## 🎯 预期修复方案

### 方案 A: 认证问题修复

**如果**: 用户未登录或 Session 失效

**修复步骤**:
1. 确保用户完成 Google OAuth 登录
2. 检查 `src/server/auth.ts` 配置
3. 验证环境变量:
   ```env
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

---

### 方案 B: 数据库问题修复

**如果**: PostgreSQL 未运行或连接失败

**修复步骤**:
1. 启动 PostgreSQL 服务
2. 运行数据库迁移:
   ```powershell
   npx prisma db push
   npx prisma generate
   ```
3. 验证数据库连接:
   ```powershell
   node test-db-connection.js
   ```

---

### 方案 C: 代码逻辑问题修复

**如果**: 前两项都正常，但仍然报错

**修复步骤**:
根据终端日志中的具体错误信息，针对性修复：
- Schema 验证错误 → 调整 Schema 定义或参数格式
- Prisma 错误 → 检查数据model 定义
- 其他运行时错误 → 根据堆栈跟踪修复

---

## ✅ 验证清单

修复后，按以下步骤验证：

1. [ ] 清除浏览器缓存和 Cookie
2. [ ] 重新登录系统
3. [ ] 访问 `/presentation` 页面
4. [ ] 输入测试内容："AI 人工智能基础介绍"
5. [ ] 点击 "Generate Presentation" 按钮
6. [ ] **预期结果**:
   - ✅ 按钮显示 loading 状态
   - ✅ 浏览器控制台无 500 错误
   - ✅ 成功跳转到 `/presentation/generate/[id]` 页面
   - ✅ 数据库中创建了新记录

---

## 📊 优先执行队列

1. **立即执行** → 查看终端日志（最快定位问题）
2. **次优先** → 检查用户登录状态
3. **第三** → 检查数据库状态
4. **最后** → 添加调试日志（如果前面都未能定位）

---

## 📝 下一步行动

**等待用户批准后，按以下顺序执行**:

1. 查看开发服务器终端日志
2. 检查浏览器 Cookie 确认登录状态
3. 测试数据库连接
4. 根据发现的问题实施针对性修复
5. 验证修复效果
6. 更新 `docs/debug_log.md` 记录修复过程

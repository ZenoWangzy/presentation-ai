# Debug Log - 项目调试与修复记录

## 1. OAuth 登录重定向问题 - 2025-11-28

### 症状
- Google 授权成功后被重定向回登录页：`/auth/signin?callbackUrl=...`，未进入主界面 `/presentation`。

### 根因
- 中间件仅检查 v4 Cookie 名称：`next-auth.session-token`/`__Secure-next-auth.session-token`。
- 项目使用 next-auth v5（Auth.js v5），实际写入的是：`authjs.session-token`/`__Secure-authjs.session-token`。
- 额外风险：`src/server/auth.ts` 中适配器使用硬编码 `DATABASE_URL` + `require()` 创建独立 PrismaClient，可能与 ESM/环境配置不一致，导致适配器初始化异常。

### 修复思路
1. 中间件兼容 v4/v5 Cookie 名称，避免误判未登录：
   - 读取顺序：`authjs.session-token` → `__Secure-authjs.session-token` → `next-auth.session-token` → `__Secure-next-auth.session-token`。
2. 适配器复用项目内 NextAuth 专用 PrismaClient：
   - 移除硬编码数据库与 `require()`，改用 `getNextAuthDb()` 与 `serverEnv.DATABASE_URL`。
   - 保留现有回调与日志，方便后续排查。

### 具体改动
- `src/middleware.ts`：
  - 新增对 `authjs.*` Cookie 的读取；原逻辑保持不变。
- `src/server/auth.ts`：
  - `createNextAuthAdapter()` 改为使用 `getNextAuthDb()`，不再硬编码 `DATABASE_URL`，不再 `require('@prisma/client')`。

### 验证要点
- 启动 dev 后执行一次完整 Google 登录：
  - DevTools → Application → Cookies 应存在 `authjs.session-token`（或兼容的 `next-auth.session-token`）。
  - 终端应出现 JWT/Session/signIn 回调日志与 PrismaAdapter 事件日志。
- 如仍无 Cookie：检查环境变量是否已设置（`AUTH_SECRET`/`NEXTAUTH_SECRET`、`GOOGLE_CLIENT_ID/SECRET`、`DATABASE_URL`、`DEEPSEEK_API_KEY`）。

### 结果
- 代码侧已修复中间件兼容性与适配器稳定性；待环境变量正确配置后，登录态应被中间件正确识别，不再发生登录后的循环重定向。

---

## 2. Generate Presentation 按钮 500 错误 - 2025-12-04

### 症状
- 在 `/presentation` 页面点击 "Generate Presentation" 按钮后无任何反应。
- 浏览器控制台显示多个 500 (Internal Server Error)。
- 页面未跳转到演示文稿生成页面。

### 根因
- **主要原因**：`.env.local` 文件中的 `DATABASE_URL` 使用了占位符凭据：`postgresql://username:password@localhost:5432/presentation_ai`。
- Next.js 优先加载 `.env.local` 环境变量，覆盖了 `.env` 中的正确配置。
- 导致 Prisma 无法连接数据库，引发认证失败错误：`Authentication failed against database server, the provided database credentials for (not available) are not valid`。
- **次要问题**：`CreatePresentationSchema` 中 `slides` 字段验证规则为 `.min(1)`，但 `createEmptyPresentation` 函数传入空数组。

### 修复思路
1. 检查环境变量配置，确认数据库连接凭据正确。
2. 修复 `.env.local` 中的 `DATABASE_URL`，使用正确的数据库凭据。
3. （附带）优化 Schema 验证规则，允许创建空演示文稿。

### 具体改动
- `.env.local`：
  - 将 `DATABASE_URL="postgresql://username:password@localhost:5432/presentation_ai"` 改为 `DATABASE_URL="postgresql://postgres:123456@localhost:5432/presentation_ai"`。
- `src/lib/schemas/action-schemas.ts`：
  - 将 `slides: z.array(PlateSlideSchema).min(1, "At least one slide is required")` 改为 `slides: z.array(PlateSlideSchema).min(0)`。

### 验证要点
- 重启开发服务器后，数据库连接健康检查应显示成功：
  - 终端应显示 `✅ [default] 数据库连接测试成功` 和 `✅ [nextauth] 数据库连接测试成功`。
- 在 `/presentation` 页面输入内容并点击 "Generate Presentation" 按钮：
  - 应成功跳转到 `/presentation/generate/[id]` 页面。
  - 浏览器控制台无 500 错误。
  - 演示文稿记录成功创建到数据库。

### 调查过程
1. 初步检查确认 PostgreSQL 服务运行正常，数据库连接测试通过。
2. 代码审查发现 Schema 验证问题，修复后 500 错误仍然存在。
3. 创建测试脚本直接操作 Prisma，成功验证数据库层面无问题，将问题范围缩小到 Next.js Server Action 层面。
4. 获取服务器终端日志，发现关键错误：数据库认证失败。
5. 检查环境变量文件，发现 `.env.local` 中的占位符凭据。
6. 修复 `.env.local` 后重启服务器，功能恢复正常。

### 结果
- `.env.local` 中的数据库凭据已修复。
- Schema 验证规则已优化。
- 功能完全恢复正常，可以成功创建演示文稿并跳转到生成页面。
- 无浏览器控制台错误，数据库连接健康检查通过。

---

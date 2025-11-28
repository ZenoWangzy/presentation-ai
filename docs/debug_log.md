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


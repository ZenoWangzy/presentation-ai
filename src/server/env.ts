/**
 * 服务端专用环境变量模块
 *
 * 此模块专门用于服务端环境变量的访问和管理
 * 解决Next.js构建时与运行时环境变量访问不一致的问题
 *
 * 关键特性：
 * 1. 直接从process.env读取，避免任何模块缓存问题
 * 2. 提供多层次验证机制
 * 3. 为NextAuth和其他服务端模块提供可靠的环境变量访问
 * 4. 包含详细的调试信息用于问题排查
 */

import { z } from "zod";

/**
 * 环境变量Schema定义
 * 使用Zod进行运行时验证，确保类型安全
 */
const serverEnvSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").url("DATABASE_URL must be a valid URL"),

  // NextAuth配置
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),

  // Google OAuth配置
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // AI服务配置
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY is required"),
  OPENAI_API_KEY: z.string().optional(),
  TOGETHER_AI_API_KEY: z.string().optional(),

  // 文件上传配置
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // 其他配置
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default("3000"),
});

/**
 * 类型定义
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * 环境变量验证状态
 */
interface ValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
}

/**
 * 验证环境变量状态
 */
function validateEnvironmentStatus(): ValidationStatus {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];

  // 检查必需的环境变量
  const requiredVars = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "DEEPSEEK_API_KEY"
  ];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missing.push(varName);
      errors.push(`${varName} is missing or empty`);
    }
  });

  // 验证DATABASE_URL格式
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.startsWith("postgresql://")) {
    warnings.push("DATABASE_URL should start with postgresql://");
  }

  // 检查NextAuth URL配置
  if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL) {
    warnings.push("NEXTAUTH_URL should be set in production");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing
  };
}

/**
 * 获取原始环境变量（调试用）
 * 此函数仅用于调试，不会在生产环境暴露敏感信息
 */
function getRawEnvironmentInfo() {
  return {
    NODE_ENV: process.env.NODE_ENV || "undefined",
    DATABASE_URL: process.env.DATABASE_URL ? "***SET***" : "***MISSING***",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "***SET***" : "***MISSING***",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "***SET***" : "***MISSING***",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "***SET***" : "***MISSING***",
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? "***SET***" : "***MISSING***",
  };
}

/**
 * 创建服务端环境变量对象
 *
 * 此函数是整个模块的核心，它：
 * 1. 直接从process.env读取环境变量
 * 2. 进行类型验证和转换
 * 3. 提供详细的调试信息
 * 4. 确保在任何情况下都能返回一致的结果
 */
function createServerEnv(): ServerEnv {
  // 首先验证环境状态
  const validation = validateEnvironmentStatus();

  if (!validation.isValid) {
    console.error("❌ 服务端环境变量验证失败:");
    validation.errors.forEach(error => console.error(`   - ${error}`));

    if (process.env.NODE_ENV === "development") {
      console.error("🔍 开发环境 - 环境变量状态:");
      console.error(JSON.stringify(getRawEnvironmentInfo(), null, 2));
    }

    throw new Error(`环境变量验证失败: ${validation.errors.join(", ")}`);
  }

  if (validation.warnings.length > 0) {
    console.warn("⚠️ 环境变量警告:");
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // 构建环境变量对象
  const rawEnv = {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TOGETHER_AI_API_KEY: process.env.TOGETHER_AI_API_KEY,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
  };

  // 验证和转换环境变量
  try {
    const validatedEnv = serverEnvSchema.parse(rawEnv);

    console.log("✅ 服务端环境变量验证成功");
    console.log(`🔧 数据库连接: ${validatedEnv.DATABASE_URL ? "已配置" : "未配置"}`);
    console.log(`🔑 Google OAuth: ${validatedEnv.GOOGLE_CLIENT_ID ? "已配置" : "未配置"}`);
    console.log(`🤖 AI服务: ${validatedEnv.DEEPSEEK_API_KEY ? "DeepSeek已配置" : "未配置"}`);

    return validatedEnv;
  } catch (error) {
    console.error("❌ 环境变量Schema验证失败:", error);
    throw new Error(`环境变量格式错误: ${error.message}`);
  }
}

/**
 * 导出服务端环境变量实例
 *
 * 重要说明：
 * 1. 使用立即执行函数确保在模块加载时就完成验证
 * 2. 避免在模块级别缓存，确保每次调用都获取最新值
 * 3. 提供重新初始化的能力用于开发环境热重载
 */
let serverEnvCache: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  // 在开发环境下，避免缓存以确保热重载时环境变量更新
  if (process.env.NODE_ENV === "development") {
    return createServerEnv();
  }

  // 在生产环境下，使用缓存提高性能
  if (!serverEnvCache) {
    serverEnvCache = createServerEnv();
  }

  return serverEnvCache;
}

/**
 * 重新初始化环境变量（开发环境用）
 */
export function resetServerEnv(): void {
  if (process.env.NODE_ENV === "development") {
    serverEnvCache = null;
    console.log("🔄 服务端环境变量缓存已重置");
  }
}

/**
 * 获取环境变量状态报告（调试用）
 */
export function getEnvironmentReport(): {
  status: "healthy" | "warning" | "error";
  details: ValidationStatus;
  timestamp: string;
} {
  const validation = validateEnvironmentStatus();

  let status: "healthy" | "warning" | "error" = "healthy";
  if (!validation.isValid) {
    status = "error";
  } else if (validation.warnings.length > 0) {
    status = "warning";
  }

  return {
    status,
    details: validation,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 默认导出当前环境变量
 */
export const serverEnv = getServerEnv();

/**
 * 向后兼容的导出
 * 保持与现有代码的兼容性
 */
export const env = serverEnv;
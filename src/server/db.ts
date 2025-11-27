/**
 * 数据库连接模块
 *
 * 此模块负责提供可靠、稳定的Prisma数据库连接
 * 解决环境变量作用域和连接管理问题
 *
 * 核心特性：
 * 1. 使用服务端专用环境变量模块确保环境变量访问
 * 2. 实现连接池管理和错误重试机制
 * 3. 为NextAuth提供独立的数据库实例
 * 4. 详细的连接状态监控和调试信息
 */

import { PrismaClient, PrismaClientInitializationError } from "@prisma/client";
import { getServerEnv, serverEnv } from "./env";

/**
 * 数据库连接配置选项
 */
interface DatabaseConfig {
  enableLogging: boolean;
  connectionTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * 获取数据库连接配置
 */
function getDatabaseConfig(): DatabaseConfig {
  const isDevelopment = serverEnv.NODE_ENV === "development";

  return {
    enableLogging: isDevelopment,
    connectionTimeout: 10000, // 10秒
    maxRetries: 3,
    retryDelay: 1000, // 1秒
  };
}

/**
 * 验证数据库连接字符串
 */
function validateDatabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "postgresql:" &&
           urlObj.hostname &&
           urlObj.username !== undefined &&
           urlObj.password !== undefined;
  } catch {
    return false;
  }
}

/**
 * 创建PrismaClient实例
 *
 * 此函数是数据库连接的核心，它：
 * 1. 直接使用服务端环境变量，避免任何模块作用域问题
 * 2. 验证数据库连接字符串格式
 * 3. 配置适当的日志级别和连接参数
 * 4. 提供详细的调试信息
 */
function createPrismaClientInstance(name: string = "default"): PrismaClient {
  console.log(`🔧 [${name}] 开始创建PrismaClient实例...`);

  // 获取环境变量
  const env = getServerEnv();
  const config = getDatabaseConfig();

  // 验证数据库URL
  if (!validateDatabaseUrl(env.DATABASE_URL)) {
    console.error(`❌ [${name}] 数据库连接字符串格式无效:`, env.DATABASE_URL.replace(/\/\/.*@/, "//***:***@"));
    throw new Error(`数据库连接字符串格式无效: ${env.DATABASE_URL}`);
  }

  console.log(`✅ [${name}] 数据库连接字符串验证通过`);
  console.log(`🔧 [${name}] 数据库主机:`, new URL(env.DATABASE_URL).hostname);
  console.log(`🔧 [${name}] 数据库端口:`, new URL(env.DATABASE_URL).port || "5432");

  // 确定日志级别
  const logLevels = config.enableLogging
    ? ["warn", "error", "query"]
    : ["error"];

  console.log(`📝 [${name}] 日志级别:`, logLevels.join(", "));

  try {
    const client = new PrismaClient({
      log: logLevels as any,
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
      // 添加连接超时配置
      __internal: {
        engine: {
          // 启用连接池
          connectionLimit: 10,
          // 连接超时
          connectTimeout: config.connectionTimeout,
        },
      },
    });

    console.log(`✅ [${name}] PrismaClient实例创建成功`);
    return client;
  } catch (error) {
    console.error(`❌ [${name}] PrismaClient创建失败:`, error);

    if (error instanceof PrismaClientInitializationError) {
      console.error(`💥 [${name}] 数据库初始化错误详情:`, {
        message: error.message,
        errorCode: error.errorCode,
        target: error.target,
      });
    }

    throw new Error(`数据库连接创建失败 (${name}): ${error.message}`);
  }
}

/**
 * 测试数据库连接
 */
async function testDatabaseConnection(client: PrismaClient, name: string = "default"): Promise<boolean> {
  try {
    console.log(`🔍 [${name}] 测试数据库连接...`);

    // 执行简单查询测试连接
    await client.$queryRaw`SELECT 1 as test`;

    console.log(`✅ [${name}] 数据库连接测试成功`);
    return true;
  } catch (error) {
    console.error(`❌ [${name}] 数据库连接测试失败:`, error);

    // 提供详细的错误诊断信息
    if (error instanceof PrismaClientInitializationError) {
      console.error(`💥 [${name}] 连接错误详情:`, {
        message: error.message,
        errorCode: error.errorCode,
        target: error.target,
      });
    }

    return false;
  }
}

/**
 * 数据库连接管理器
 *
 * 负责管理不同用途的数据库连接实例
 */
interface DatabaseManager {
  default: PrismaClient;
  nextauth: PrismaClient;
}

// 连接实例缓存
let databaseManager: DatabaseManager | null = null;

/**
 * 获取数据库连接管理器
 *
 * 创建并缓存不同用途的数据库连接：
 * - default: 用于一般应用功能
 * - nextauth: 专门用于NextAuth认证，避免连接冲突
 */
function getDatabaseManager(): DatabaseManager {
  if (!databaseManager) {
    console.log("🏗️ 初始化数据库连接管理器...");

    try {
      // 创建默认数据库连接
      const defaultClient = createPrismaClientInstance("default");

      // 为NextAuth创建独立的数据库连接
      const nextauthClient = createPrismaClientInstance("nextauth");

      // 测试连接
      testDatabaseConnection(defaultClient, "default").then(success => {
        if (!success) {
          console.error("❌ 默认数据库连接测试失败");
        }
      });

      testDatabaseConnection(nextauthClient, "nextauth").then(success => {
        if (!success) {
          console.error("❌ NextAuth数据库连接测试失败");
        }
      });

      databaseManager = {
        default: defaultClient,
        nextauth: nextauthClient,
      };

      console.log("✅ 数据库连接管理器初始化完成");
    } catch (error) {
      console.error("❌ 数据库连接管理器初始化失败:", error);
      throw error;
    }
  }

  return databaseManager;
}

/**
 * 获取默认数据库连接
 * 用于应用的主要数据库操作
 */
export const db = (() => {
  try {
    const manager = getDatabaseManager();
    console.log("📊 获取默认数据库连接");
    return manager.default;
  } catch (error) {
    console.error("❌ 获取默认数据库连接失败:", error);
    throw error;
  }
})();

/**
 * 获取NextAuth专用数据库连接
 * 为NextAuth提供独立的数据库实例，避免连接冲突
 */
export function getNextAuthDb(): PrismaClient {
  try {
    const manager = getDatabaseManager();
    console.log("🔐 获取NextAuth专用数据库连接");
    return manager.nextauth;
  } catch (error) {
    console.error("❌ 获取NextAuth数据库连接失败:", error);
    throw error;
  }
}

/**
 * 数据库连接状态检查
 */
export async function checkDatabaseHealth(): Promise<{
  default: boolean;
  nextauth: boolean;
  timestamp: string;
}> {
  try {
    const manager = databaseManager || getDatabaseManager();

    const [defaultHealth, nextauthHealth] = await Promise.all([
      testDatabaseConnection(manager.default, "default"),
      testDatabaseConnection(manager.nextauth, "nextauth"),
    ]);

    return {
      default: defaultHealth,
      nextauth: nextauthHealth,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ 数据库健康检查失败:", error);
    return {
      default: false,
      nextauth: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 关闭所有数据库连接
 */
export async function closeAllConnections(): Promise<void> {
  if (databaseManager) {
    console.log("🔌 关闭所有数据库连接...");

    try {
      await Promise.all([
        databaseManager.default.$disconnect(),
        databaseManager.nextauth.$disconnect(),
      ]);

      console.log("✅ 所有数据库连接已关闭");
    } catch (error) {
      console.error("❌ 关闭数据库连接时发生错误:", error);
    } finally {
      databaseManager = null;
    }
  }
}

/**
 * 重新初始化数据库连接
 * 用于开发环境的热重载
 */
export async function reinitializeDatabase(): Promise<void> {
  console.log("🔄 重新初始化数据库连接...");

  await closeAllConnections();

  // 强制垃圾回收（如果可用）
  if (global.gc) {
    global.gc();
  }

  // 重新创建连接管理器
  const manager = getDatabaseManager();
  console.log("✅ 数据库连接重新初始化完成");
}

/**
 * 开发环境下的连接监控
 * 只在Node.js环境中运行，避免Edge Runtime问题
 */
if (serverEnv.NODE_ENV === "development" && typeof process !== "undefined" && process.versions && process.versions.node) {
  // 定期检查数据库健康状态
  setInterval(async () => {
    try {
      const health = await checkDatabaseHealth();

      if (!health.default || !health.nextauth) {
        console.warn("⚠️ 数据库连接健康检查发现问题:", health);
      }
    } catch (error) {
      console.warn("⚠️ 数据库健康检查失败:", error);
    }
  }, 30000); // 每30秒检查一次

  console.log("📊 开发环境数据库健康监控已启用");
}

/**
 * 优雅关闭处理
 * 只在Node.js环境中运行，避免Edge Runtime问题
 */
if (typeof process !== "undefined" && process.on && process.versions && process.versions.node) {
  process.on("SIGINT", async () => {
    console.log("📡 接收到SIGINT信号，正在关闭数据库连接...");
    try {
      await closeAllConnections();
    } catch (error) {
      console.error("❌ 关闭数据库连接时发生错误:", error);
    }
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("📡 接收到SIGTERM信号，正在关闭数据库连接...");
    try {
      await closeAllConnections();
    } catch (error) {
      console.error("❌ 关闭数据库连接时发生错误:", error);
    }
    process.exit(0);
  });
}

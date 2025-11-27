/**
 * Edge Runtime安全的数据库连接模块
 *
 * 此模块专门为Edge Runtime环境设计，避免使用任何Node.js特定的API
 */

import { PrismaClient } from "@prisma/client";
import { serverEnv } from "./env";

/**
 * 简单的PrismaClient创建函数，不包含任何Node.js特定的代码
 */
export function createSimplePrismaClient(name: string = "default"): PrismaClient {
  const logLevels = serverEnv.NODE_ENV === "development"
    ? ["warn", "error", "query"]
    : ["error"];

  return new PrismaClient({
    log: logLevels as any,
    datasources: {
      db: {
        url: serverEnv.DATABASE_URL,
      },
    },
  });
}

/**
 * 默认数据库连接实例
 * 此实例可以在Edge Runtime中使用
 */
export const edgeSafeDb = createSimplePrismaClient("edge-safe-default");
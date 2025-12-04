/**
 * 数据库测试辅助工具
 */

import { PrismaClient } from '@prisma/client';
import { beforeAll, beforeEach, afterAll } from 'vitest';

// 创建测试用Prisma客户端
export const createTestPrismaClient = () => {
    return new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    });
};

// 全局测试数据库客户端
let testDb: PrismaClient | null = null;

/**
 * 获取测试数据库客户端
 */
export const getTestDb = () => {
    if (!testDb) {
        testDb = createTestPrismaClient();
    }
    return testDb;
};

/**
 * 清理测试数据库
 * 按依赖顺序删除所有表的数据
 */
export const cleanupDatabase = async (db: PrismaClient) => {
    // 按依赖关系倒序删除
    await db.favoriteDocument.deleteMany();
    await db.generatedImage.deleteMany();
    await db.presentation.deleteMany();
    await db.baseDocument.deleteMany();
    await db.customTheme.deleteMany();
    await db.account.deleteMany();
    await db.user.deleteMany();
};

/**
 * 创建测试用户
 */
export const createTestUser = async (db: PrismaClient, data?: Partial<any>) => {
    return db.user.create({
        data: {
            email: data?.email || `test-${Date.now()}@example.com`,
            name: data?.name || 'Test User',
            hasAccess: true,
            role: 'USER',
            ...data,
        },
    });
};

/**
 * 创建测试演示文稿
 */
export const createTestPresentation = async (
    db: PrismaClient,
    userId: string,
    data?: Partial<any>
) => {
    // 先创建BaseDocument
    const baseDoc = await db.baseDocument.create({
        data: {
            title: data?.title || 'Test Presentation',
            type: 'PRESENTATION',
            userId,
            documentType: 'PRESENTATION',
        },
    });

    // 再创建Presentation
    const presentation = await db.presentation.create({
        data: {
            id: baseDoc.id,
            content: data?.content || { slides: [] },
            theme: data?.theme || 'default',
            outline: data?.outline || [],
            ...data,
        },
    });

    return presentation;
};


/**
 * 数据库测试生命周期钩子
 */
export const setupDatabaseTests = () => {
    let db: PrismaClient;

    beforeAll(async () => {
        db = getTestDb();
        // 可以在这里运行迁移
        // await db.$executeRaw`...`;
    });

    beforeEach(async () => {
        // 每个测试前清理数据库
        await cleanupDatabase(db);
    });

    afterAll(async () => {
        // 测试结束后清理并断开连接
        await cleanupDatabase(db);
        await db.$disconnect();
    });

    return () => db;
};

/**
 * 关闭测试数据库连接
 */
export const closeTestDb = async () => {
    if (testDb) {
        await testDb.$disconnect();
        testDb = null;
    }
};

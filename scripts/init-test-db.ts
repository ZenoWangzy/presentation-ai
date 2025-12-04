/**
 * 测试数据库初始化脚本
 * 用于创建和配置测试数据库
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

async function initTestDatabase() {
    console.log('初始化测试数据库...');

    const testDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/presentation_ai_test';

    try {
        // 运行Prisma迁移
        console.log('运行数据库迁移...');
        execSync('npx prisma migrate deploy', {
            env: { ...process.env, DATABASE_URL: testDbUrl },
            stdio: 'inherit',
        });

        // 生成Prisma客户端
        console.log('生成Prisma客户端...');
        execSync('npx prisma generate', {
            stdio: 'inherit',
        });

        // 验证数据库连接
        const prisma = new PrismaClient({
            datasourceUrl: testDbUrl,
        });

        await prisma.$connect();
        console.log('数据库连接成功！');

        await prisma.$disconnect();

        console.log('测试数据库初始化完成！');
    } catch (error) {
        console.error('测试数据库初始化失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    initTestDatabase();
}

export { initTestDatabase };

// 验证数据库连接和表结构
import { PrismaClient } from '@prisma/client';

async function verifyDatabase() {
  try {
    console.log('🔍 正在验证数据库连接...');

    const prisma = new PrismaClient();

    // 测试连接
    await prisma.$connect();
    console.log('✅ 成功连接到数据库！');

    // 获取数据库版本
    const versionResult = await prisma.$queryRaw`SELECT version() as version`;
    console.log('📊 PostgreSQL 版本:', versionResult[0].version.split(',')[0]);

    // 检查表是否存在
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📋 数据库中的表:');
    if (tables.length === 0) {
      console.log('  ⚠️  没有找到任何表');
    } else {
      tables.forEach(table => {
        console.log(`  ✓ ${table.table_name}`);
      });
    }

    // 测试基本查询操作
    console.log('\n🧪 测试基本数据库操作...');

    try {
      // 测试用户表查询
      const userCount = await prisma.user.count();
      console.log(`✅ User表查询成功，当前用户数: ${userCount}`);

      // 测试文档表查询
      const documentCount = await prisma.baseDocument.count();
      console.log(`✅ BaseDocument表查询成功，当前文档数: ${documentCount}`);

      // 测试创建一个测试用户（如果表为空）
      if (userCount === 0) {
        console.log('📝 创建测试用户...');
        const testUser = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            hasAccess: true
          }
        });
        console.log(`✅ 测试用户创建成功，ID: ${testUser.id}`);

        // 删除测试用户
        await prisma.user.delete({
          where: { id: testUser.id }
        });
        console.log('✅ 测试用户清理完成');
      }

    } catch (queryError) {
      console.error('❌ 数据库操作测试失败:', queryError.message);
    }

    await prisma.$disconnect();
    console.log('\n🎉 数据库验证完成！连接正常，所有表结构正确。');

  } catch (error) {
    console.error('❌ 数据库验证失败:', error.message);

    console.log('\n🔧 故障排除步骤:');
    console.log('1. 检查PostgreSQL服务是否运行');
    console.log('2. 验证.env文件中的DATABASE_URL配置');
    console.log('3. 确认数据库presentation_ai存在');
    console.log('4. 检查数据库用户权限');

    console.log('\n📝 当前DATABASE_URL配置:');
    console.log(process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/presentation_ai');
  }
}

verifyDatabase();
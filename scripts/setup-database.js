// 使用原生PostgreSQL连接来创建数据库
async function setupDatabase() {
  console.log('正在尝试连接到默认的postgres数据库...');

  // 首先尝试连接到默认的postgres数据库
  const { Pool } = await import('pg');

  const postgresClient = new Pool({
    connectionString: 'postgresql://postgres:123456@localhost:5432/postgres'
  });

  try {
    // 连接到默认postgres数据库
    await postgresClient.connect();
    console.log('✅ 成功连接到默认postgres数据库！');

    // 检查presentation_ai数据库是否存在
    const checkResult = await postgresClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      ['presentation_ai']
    );

    if (checkResult.rows.length === 0) {
      // 创建数据库
      console.log('正在创建 presentation_ai 数据库...');
      await postgresClient.query('CREATE DATABASE presentation_ai');
      console.log('✅ presentation_ai 数据库创建成功！');
    } else {
      console.log('✅ presentation_ai 数据库已存在。');
    }

    await postgresClient.end();

    // 现在测试连接到新创建的数据库
    console.log('\n正在测试连接到 presentation_ai 数据库...');
    const presentationClient = new Pool({
      connectionString: 'postgresql://postgres:123456@localhost:5432/presentation_ai'
    });

    await presentationClient.connect();
    const versionResult = await presentationClient.query('SELECT version() as version');
    console.log('PostgreSQL 版本:', versionResult.rows[0].version.split(',')[0]);

    await presentationClient.end();
    console.log('\n✅ 数据库设置完成！');

  } catch (error) {
    console.error('❌ 数据库设置失败:', error.message);

    // 如果连接失败，提供详细的解决方案
    console.log('\n📋 解决方案:');
    console.log('1. 确认PostgreSQL服务正在运行 (服务名: postgresql-x64-18)');
    console.log('2. 检查默认用户名: postgres, 密码: 123456');
    console.log('3. 确认端口: 5432');
    console.log('4. 使用pgAdmin手动创建数据库');

    console.log('\n📝 pgAdmin手动创建步骤:');
    console.log('1. 打开pgAdmin');
    console.log('2. 连接到服务器 (localhost:5432)');
    console.log('3. 右键点击 Databases > Create > Database');
    console.log('4. 数据库名: presentation_ai');
    console.log('5. 点击 Save');

    console.log('\n📝 或使用psql命令行:');
    console.log('1. 打开psql');
    console.log('2. 运行: CREATE DATABASE presentation_ai;');
  } finally {
    await postgresClient.end();
  }
}

setupDatabase();
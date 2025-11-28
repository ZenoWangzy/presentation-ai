import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:123456@localhost:5432/presentation_ai',
        },
    },
});

async function testConnection() {
    try {
        console.log('Attempting to connect to database...');
        await prisma.$connect();
        console.log('✅ Database connection successful!');

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Query successful:', result);

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error details:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();

/**
 * Faker配置和测试数据生成辅助工具
 */

import { faker } from '@faker-js/faker';

// 设置固定种子确保测试数据可重现
faker.seed(12345);

/**
 * 生成测试用户数据
 */
export const generateMockUser = () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    image: faker.image.avatar(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    role: 'USER' as const,
    hasAccess: true,
});

/**
 * 生成测试演示文稿数据
 */
export const generateMockPresentation = () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: {
        slides: [
            {
                id: faker.string.uuid(),
                layoutType: 'title',
                content: [
                    {
                        type: 'h1',
                        children: [{ text: faker.lorem.sentence() }],
                    },
                ],
            },
        ],
    },
    theme: 'default',
    imageSource: 'ai',
    language: 'zh-CN',
    outline: [
        '# ' + faker.lorem.sentence(),
        '## ' + faker.lorem.sentence(),
        '### ' + faker.lorem.sentence(),
    ],
});

/**
 * 生成测试基础文档数据
 */
export const generateMockBaseDocument = (userId: string) => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    type: 'PRESENTATION' as const,
    userId,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    isPublic: false,
    documentType: 'PRESENTATION',
});

/**
 * 生成测试图片数据
 */
export const generateMockImage = () => ({
    id: faker.string.uuid(),
    url: faker.image.url(),
    prompt: faker.lorem.sentence(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
});

/**
 * 生成测试幻灯片数据
 */
export const generateMockSlide = (layoutType: string = 'default') => ({
    id: faker.string.uuid(),
    layoutType,
    content: [
        {
            type: 'h2',
            children: [{ text: faker.lorem.sentence() }],
        },
        {
            type: 'p',
            children: [{ text: faker.lorem.paragraph() }],
        },
    ],
    alignment: 'left',
});

// 重新导出faker实例供其他测试使用
export { faker };

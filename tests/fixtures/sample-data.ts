/**
 * 测试Fixture数据
 * 提供预定义的测试数据样本
 */

import type { PlateSlide } from '@/components/presentation/utils/parser';


/**
 * 简单的标题幻灯片
 */
export const simpleTitleSlide: PlateSlide = {
    id: 'slide-1',
    layoutType: 'title',
    content: [
        {
            type: 'h1',
            children: [{ text: 'AI技术培训课程' }],
        },
    ],
    alignment: 'center',
};

/**
 * 带图片的左布局幻灯片
 */
export const leftLayoutSlideWithImage: PlateSlide = {
    id: 'slide-2',
    layoutType: 'left',
    content: [
        {
            type: 'h2',
            children: [{ text: '什么是人工智能' }],
        },
        {
            type: 'p',
            children: [{ text: '人工智能是计算机科学的一个分支，致力于创建智能系统。' }],
        },
    ],
    rootImage: {
        query: 'artificial intelligence concept',
        url: 'https://example.com/ai-concept.png',
    },
    alignment: 'left',
};

/**
 * 项目符号布局幻灯片
 */
export const bulletsLayoutSlide: PlateSlide = {
    id: 'slide-3',
    layoutType: 'bullets',
    content: [
        {
            type: 'h2',
            children: [{ text: '机器学习类型' }],
        },
        {
            type: 'ul',
            children: [
                {
                    type: 'li',
                    children: [{ text: '监督学习' }],
                },
                {
                    type: 'li',
                    children: [{ text: '非监督学习' }],
                },
                {
                    type: 'li',
                    children: [{ text: '强化学习' }],
                },
            ],
        },
    ],
    alignment: 'left',
};

/**
 * 完整的培训PPT示例（5张幻灯片）
 */
export const sampleTrainingPresentation: PlateSlide[] = [
    simpleTitleSlide,
    leftLayoutSlideWithImage,
    bulletsLayoutSlide,
    {
        id: 'slide-4',
        layoutType: 'default',
        content: [
            {
                type: 'h2',
                children: [{ text: 'AI应用场景' }],
            },
            {
                type: 'p',
                children: [{ text: '人工智能在各个领域都有广泛应用：图像识别、自然语言处理、推荐系统等。' }],
            },
        ],
        alignment: 'left',
    },
    {
        id: 'slide-5',
        layoutType: 'title',
        content: [
            {
                type: 'h1',
                children: [{ text: '感谢观看' }],
            },
            {
                type: 'p',
                children: [{ text: 'Questions?' }],
            },
        ],
        alignment: 'center',
    },
];

/**
 * 培训PPT大纲示例
 */
export const sampleOutline = [
    '# AI技术培训课程',
    '## 1. 人工智能基础',
    '### 什么是AI',
    '### 机器学习简介',
    '## 2. AI应用',
    '### 图像识别',
    '### NLP应用',
    '## 3. 总结',
];

/**
 * Mock搜索结果
 */
export const mockSearchResults = [
    {
        query: 'AI training',
        results: [
            {
                title: 'Introduction to Artificial Intelligence',
                content: 'AI is a branch of computer science...',
                url: 'https://example.com/ai-intro',
            },
            {
                title: 'Machine Learning Basics',
                content: 'Machine learning is a subset of AI...',
                url: 'https://example.com/ml-basics',
            },
        ],
    },
];

/**
 * Mock演示文稿内容
 */
export const mockPresentationContent = {
    slides: sampleTrainingPresentation,
    theme: 'default',
    title: 'AI技术培训课程',
};

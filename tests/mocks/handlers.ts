/**
 * MSW (Mock Service Worker) 请求处理器
 * 定义所有需要mock的外部服务请求
 */

import { http, HttpResponse } from 'msw';

// ============================================
// AI服务 Mock Handlers
// ============================================

/**
 * Mock DeepSeek API - 大纲生成
 */
export const mockDeepSeekOutline = http.post(
    'https://api.deepseek.com/v1/chat/completions',
    async ({ request }) => {
        const body = await request.json() as any;

        // 模拟生成培训PPT大纲
        const mockOutline = [
            '# AI技术培训课程',
            '## 1. 人工智能基础概念',
            '### 什么是人工智能',
            '### 机器学习简介',
            '### 深度学习入门',
            '## 2. AI应用场景',
            '### 图像识别',
            '### 自然语言处理',
            '### 推荐系统',
            '## 3. 案例分析',
            '### 实际应用案例',
            '## 4. 总结与展望',
        ];

        return HttpResponse.json({
            id: 'mock-completion-id',
            object: 'chat.completion',
            created: Date.now(),
            model: 'deepseek-chat',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: mockOutline.join('\n'),
                    },
                    finish_reason: 'stop',
                },
            ],
        });
    }
);

/**
 * Mock DeepSeek API - 幻灯片生成（流式）
 */
export const mockDeepSeekSlides = http.post(
    'https://api.deepseek.com/v1/chat/completions',
    async ({ request }) => {
        const body = await request.json() as any;

        // 检查是否是幻灯片生成请求
        if (body.stream) {
            // 模拟流式响应
            const mockSlideContent = `<PRESENTATION>
<SECTION layout="title">
<h1>AI技术培训课程</h1>
</SECTION>
<SECTION layout="left">
<h2>什么是人工智能</h2>
<p>人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。</p>
<IMG query="artificial intelligence concept diagram" />
</SECTION>
<SECTION layout="bullets">
<h2>机器学习核心概念</h2>
<ul>
<li>监督学习</li>
<li>非监督学习</li>
<li>强化学习</li>
</ul>
</SECTION>
</PRESENTATION>`;

            return new HttpResponse(mockSlideContent, {
                headers: {
                    'Content-Type': 'text/event-stream',
                },
            });
        }

        return HttpResponse.json({ error: 'Mock only supports streaming' }, { status: 400 });
    }
);

/**
 * Mock Together AI - 图片生成
 */
export const mockTogetherImageGeneration = http.post(
    'https://api.together.xyz/v1/images/generations',
    async ({ request }) => {
        const body = await request.json() as any;

        return HttpResponse.json({
            id: 'mock-image-gen-id',
            created: Date.now(),
            data: [
                {
                    url: 'https://example.com/mock-generated-image.png',
                    b64_json: null,
                },
            ],
        });
    }
);

// ============================================
// UploadThing Mock Handlers
// ============================================

/**
 * Mock UploadThing - 文件上传
 */
export const mockUploadThingUpload = http.post(
    'https://uploadthing.com/api/uploadFiles',
    async ({ request }) => {
        return HttpResponse.json({
            data: [
                {
                    key: 'mock-file-key',
                    url: 'https://utfs.io/f/mock-file-key',
                    name: 'test-image.png',
                    size: 1024,
                },
            ],
        });
    }
);

// ============================================
// Tavily 搜索 Mock Handlers
// ============================================

/**
 * Mock Tavily - 网络搜索
 */
export const mockTavilySearch = http.post(
    'https://api.tavily.com/search',
    async ({ request }) => {
        const body = await request.json() as any;

        return HttpResponse.json({
            query: body.query,
            results: [
                {
                    title: 'Mock Search Result 1',
                    url: 'https://example.com/result-1',
                    content: 'This is a mock search result for testing purposes.',
                    score: 0.95,
                },
                {
                    title: 'Mock Search Result 2',
                    url: 'https://example.com/result-2',
                    content: 'Another mock search result with relevant information.',
                    score: 0.87,
                },
            ],
        });
    }
);

// ============================================
// Unsplash Mock Handlers
// ============================================

/**
 * Mock Unsplash - 图片搜索
 */
export const mockUnsplashSearch = http.get(
    'https://api.unsplash.com/search/photos',
    ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('query');

        return HttpResponse.json({
            results: [
                {
                    id: 'mock-photo-1',
                    urls: {
                        regular: 'https://images.unsplash.com/mock-photo-1',
                        small: 'https://images.unsplash.com/mock-photo-1-small',
                    },
                    alt_description: `Mock photo for ${query}`,
                    user: {
                        name: 'Mock Photographer',
                        username: 'mockuser',
                    },
                },
            ],
            total: 1,
        });
    }
);

// ============================================
// 导出所有handlers
// ============================================

export const handlers = [
    // AI服务
    mockDeepSeekOutline,
    mockDeepSeekSlides,
    mockTogetherImageGeneration,

    // 外部服务
    mockUploadThingUpload,
    mockTavilySearch,
    mockUnsplashSearch,
];

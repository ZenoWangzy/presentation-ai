import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { convertPlateJSToPPTX } from '@/components/presentation/utils/exportToPPT';
import type { PlateSlide } from '@/components/presentation/utils/parser';

describe('PPTX Export - Smoke Tests', () => {
    describe('基础导出功能', () => {
        it('应该能够导出一个空白幻灯片', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: undefined,
                    content: [],
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });

            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);
        });

        it('应该能够导出包含标题的幻灯片', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: undefined,
                    content: [
                        {
                            type: 'h1',
                            children: [{ text: '测试标题' }],
                        },
                    ],
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            expect(buffer.byteLength).toBeGreaterThan(0);
        });

        it('应该能够导出包含段落的幻灯片', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: undefined,
                    content: [
                        {
                            type: 'h1',
                            children: [{ text: '标题' }],
                        },
                        {
                            type: 'p',
                            children: [{ text: '这是一段测试文本内容' }],
                        },
                    ],
                    alignment: 'start',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            expect(buffer.byteLength).toBeGreaterThan(0);
        });
    });

    describe('PPTX文件结构验证', () => {
        it('导出的文件应该是有效的ZIP格式', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: undefined,
                    content: [{ type: 'h1', children: [{ text: '测试' }] }],
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });

            // 应该能够作为ZIP文件打开
            const zip = await JSZip.loadAsync(buffer);
            expect(zip).toBeDefined();
        });

        it('应该包含必要的PPTX文件结构', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: undefined,
                    content: [{ type: 'h1', children: [{ text: '测试' }] }],
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            const zip = await JSZip.loadAsync(buffer);

            // 检查关键文件是否存在
            expect(zip.file('[Content_Types].xml')).toBeTruthy();
            expect(zip.file('_rels/.rels')).toBeTruthy();
            expect(zip.file('ppt/presentation.xml')).toBeTruthy();
        });

        it('应该包含正确数量的幻灯片文件', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: undefined,
                    content: [{ type: 'h1', children: [{ text: '第一页' }] }],
                    alignment: 'center',
                },
                {
                    id: 'slide-2',
                    layoutType: undefined,
                    content: [{ type: 'h1', children: [{ text: '第二页' }] }],
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            const zip = await JSZip.loadAsync(buffer);

            // 应该有2个幻灯片文件
            expect(zip.file('ppt/slides/slide1.xml')).toBeTruthy();
            expect(zip.file('ppt/slides/slide2.xml')).toBeTruthy();
        });
    });

    describe('布局类型导出', () => {
        it('应该能够导出left布局的幻灯片', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: 'left',
                    content: [{ type: 'h1', children: [{ text: '左侧布局' }] }],
                    rootImage: {
                        query: 'test image',
                        url: 'https://example.com/image.png',
                    },
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            expect(buffer.byteLength).toBeGreaterThan(0);
        });

        it('应该能够导出right布局的幻灯片', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: 'right',
                    content: [{ type: 'h1', children: [{ text: '右侧布局' }] }],
                    rootImage: {
                        query: 'test image',
                        url: 'https://example.com/image.png',
                    },
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            expect(buffer.byteLength).toBeGreaterThan(0);
        });

        it('应该能够导出vertical布局的幻灯片', async () => {
            const slides: PlateSlide[] = [
                {
                    id: 'slide-1',
                    layoutType: 'vertical',
                    content: [{ type: 'h1', children: [{ text: '垂直布局' }] }],
                    rootImage: {
                        query: 'test image',
                        url: 'https://example.com/image.png',
                    },
                    alignment: 'center',
                },
            ];

            const buffer = await convertPlateJSToPPTX({ slides });
            expect(buffer.byteLength).toBeGreaterThan(0);
        });
    });

    describe('多幻灯片导出', () => {
        it('应该能够导出多个幻灯片', async () => {
            const slides: PlateSlide[] = Array.from({ length: 5 }, (_, i) => ({
                id: `slide-${i + 1}`,
                layoutType: undefined,
                content: [
                    {
                        type: 'h1',
                        children: [{ text: `幻灯片 ${i + 1}` }],
                    },
                ],
                alignment: 'center' as const,
            }));

            const buffer = await convertPlateJSToPPTX({ slides });
            const zip = await JSZip.loadAsync(buffer);

            // 验证所有幻灯片都被创建
            for (let i = 1; i <= 5; i++) {
                expect(zip.file(`ppt/slides/slide${i}.xml`)).toBeTruthy();
            }
        });
    });
});

import { describe, it, expect } from 'vitest';
import { SlideParser } from '@/components/presentation/utils/parser';

describe('SlideParser - Smoke Tests', () => {
    describe('基础解析功能', () => {
        it('应该能够解析简单的H1标题', () => {
            const parser = new SlideParser();
            parser.parseChunk('<PRESENTATION><SECTION><H1>测试标题</H1></SECTION></PRESENTATION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides).toHaveLength(1);
            expect(slides[0]?.content).toBeDefined();
            expect(slides[0]?.content[0]).toHaveProperty('type', 'h1');
        });

        it('应该能够解析段落文本', () => {
            const parser = new SlideParser();
            parser.parseChunk('<PRESENTATION><SECTION><P>这是一段测试文本</P></SECTION></PRESENTATION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides).toHaveLength(1);
            expect(slides[0]?.content[0]).toHaveProperty('type', 'p');
        });

        it('应该能够解析多个SECTION', () => {
            const parser = new SlideParser();
            parser.parseChunk(`
        <PRESENTATION>
          <SECTION><H1>第一页</H1></SECTION>
          <SECTION><H1>第二页</H1></SECTION>
        </PRESENTATION>
      `);
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides).toHaveLength(2);
        });
    });

    describe('IMG标签解析 - 引号完整性', () => {
        it('应该忽略没有成对引号的IMG标签', () => {
            const parser = new SlideParser();
            parser.parseChunk('<PRESENTATION><SECTION><IMG query="未闭合></SECTION></PRESENTATION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides[0]?.rootImage).toBeUndefined();
        });

        it('应该正确解析有成对引号的IMG标签', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION layout="left"><IMG query="mountain sunrise" /></SECTION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides[0]?.rootImage?.query).toBe('mountain sunrise');
            expect(slides[0]?.layoutType).toBe('left');
        });

        it('应该支持中文查询', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION><IMG query="美丽的山景" /></SECTION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides[0]?.rootImage?.query).toBe('美丽的山景');
        });
    });

    describe('流式解析能力', () => {
        it('应该能够处理分块到达的XML', () => {
            const parser = new SlideParser();

            // 模拟流式数据,每次传入完整的累积内容
            parser.parseChunk('<PRESENTATION><SECTION><H1>标');
            parser.parseChunk('<PRESENTATION><SECTION><H1>标题</H1>');
            parser.parseChunk('<PRESENTATION><SECTION><H1>标题</H1></SECTION></PRESENTATION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides).toHaveLength(1);
        });

        it('应该能够处理不完整的标签', () => {
            const parser = new SlideParser();

            // 模拟流式数据到达,每次传入累积内容
            parser.parseChunk('<PRESENTATION><SECTION><P>这是');
            parser.parseChunk('<PRESENTATION><SECTION><P>这是一段文本</P></SECTION></PRESENTATION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides).toHaveLength(1);
        });
    });

    describe('布局类型解析', () => {
        it('应该识别left布局', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION layout="left"><H1>标题</H1></SECTION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides[0]?.layoutType).toBe('left');
        });

        it('应该识别right布局', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION layout="right"><H1>标题</H1></SECTION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides[0]?.layoutType).toBe('right');
        });

        it('应该识别vertical布局', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION layout="vertical"><H1>标题</H1></SECTION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides[0]?.layoutType).toBe('vertical');
        });
    });

    describe('解析器状态管理', () => {
        it('reset() 应该清空所有状态', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION><H1>测试</H1></SECTION>');
            parser.finalize();

            expect(parser.getAllSlides()).toHaveLength(1);

            parser.reset();
            expect(parser.getAllSlides()).toHaveLength(0);
        });

        it('应该能够在reset后重新使用', () => {
            const parser = new SlideParser();
            parser.parseChunk('<SECTION><H1>第一次</H1></SECTION>');
            parser.finalize();

            parser.reset();

            parser.parseChunk('<SECTION><H1>第二次</H1></SECTION>');
            parser.finalize();

            const slides = parser.getAllSlides();
            expect(slides).toHaveLength(1);
        });
    });
});

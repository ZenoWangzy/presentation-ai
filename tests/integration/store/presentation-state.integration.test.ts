/**
 * Zustand Store 集成测试
 * 测试presentation-state的状态管理逻辑
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePresentationState } from '@/states/presentation-state';
import { sampleTrainingPresentation } from '../../fixtures/sample-data';
import type { PlateSlide } from '@/components/presentation/utils/parser';

describe('Presentation State Integration Tests', () => {
    beforeEach(() => {
        // 重置store到初始状态
        const state = usePresentationState.getState();
        state.setSlides([]);
        state.setCurrentPresentation(null, null);
        // 清除所有图片生成状态
        Object.keys(state.rootImageGeneration).forEach(slideId => {
            state.clearRootImageGeneration(slideId);
        });
    });

    describe('幻灯片状态管理', () => {
        it('should set and retrieve slides correctly', () => {
            const { setSlides } = usePresentationState.getState();

            setSlides(sampleTrainingPresentation);

            // 重新获取最新状态
            const currentSlides = usePresentationState.getState().slides;
            expect(currentSlides).toHaveLength(5);
            expect(currentSlides[0]?.id).toBe('slide-1');
            expect(currentSlides[0]?.layoutType).toBe('title');
        });

        it('should update slides with new content', () => {
            const { setSlides } = usePresentationState.getState();

            setSlides(sampleTrainingPresentation);

            // 使用现有的slide而不是创建新的，避免类型问题
            const updatedSlides = sampleTrainingPresentation.slice(0, 3);

            setSlides(updatedSlides);

            expect(usePresentationState.getState().slides).toHaveLength(3);
            expect(usePresentationState.getState().slides[2]?.id).toBe('slide-3');
        });
    });

    describe('图片生成状态管理', () => {
        it('should start root image generation', () => {
            const { startRootImageGeneration } = usePresentationState.getState();

            startRootImageGeneration('slide-1', 'AI concept diagram');

            // 重新获取最新状态
            const currentState = usePresentationState.getState().rootImageGeneration;
            expect(currentState['slide-1']).toBeDefined();
            expect(currentState['slide-1']?.status).toBe('pending');
            expect(currentState['slide-1']?.query).toBe('AI concept diagram');
        });

        it('should complete root image generation', () => {
            const { startRootImageGeneration, completeRootImageGeneration } =
                usePresentationState.getState();

            startRootImageGeneration('slide-1', 'AI concept diagram');
            completeRootImageGeneration('slide-1', 'https://example.com/image.png');

            // 重新获取最新状态
            const currentState = usePresentationState.getState().rootImageGeneration;
            expect(currentState['slide-1']?.status).toBe('success');
            expect(currentState['slide-1']?.url).toBe('https://example.com/image.png');
        });

        it('should fail root image generation', () => {
            const { startRootImageGeneration, failRootImageGeneration } =
                usePresentationState.getState();

            startRootImageGeneration('slide-1', 'AI concept diagram');
            failRootImageGeneration('slide-1', 'Network error');

            // 重新获取最新状态
            const currentState = usePresentationState.getState().rootImageGeneration;
            expect(currentState['slide-1']?.status).toBe('error');
            expect(currentState['slide-1']?.error).toBe('Network error');
        });

        it('should clear root image generation', () => {
            const { startRootImageGeneration, clearRootImageGeneration } =
                usePresentationState.getState();

            startRootImageGeneration('slide-1', 'AI concept diagram');
            expect(usePresentationState.getState().rootImageGeneration['slide-1']).toBeDefined();

            clearRootImageGeneration('slide-1');
            expect(usePresentationState.getState().rootImageGeneration['slide-1']).toBeUndefined();
        });
    });

    describe('并发图片生成场景', () => {
        it('should handle concurrent root image generation for multiple slides', () => {
            const { startRootImageGeneration, completeRootImageGeneration } =
                usePresentationState.getState();

            // 同时为3个幻灯片启动图片生成
            startRootImageGeneration('slide-1', 'query-1');
            startRootImageGeneration('slide-2', 'query-2');
            startRootImageGeneration('slide-3', 'query-3');

            let currentState = usePresentationState.getState().rootImageGeneration;
            expect(Object.keys(currentState)).toHaveLength(3);
            expect(currentState['slide-1']?.status).toBe('pending');
            expect(currentState['slide-2']?.status).toBe('pending');
            expect(currentState['slide-3']?.status).toBe('pending');

            // 完成其中一个
            completeRootImageGeneration('slide-2', 'https://example.com/image-2.png');

            currentState = usePresentationState.getState().rootImageGeneration;
            expect(currentState['slide-1']?.status).toBe('pending');
            expect(currentState['slide-2']?.status).toBe('success');
            expect(currentState['slide-3']?.status).toBe('pending');
        });

        it('should handle mixed success and failure states', () => {
            const {
                startRootImageGeneration,
                completeRootImageGeneration,
                failRootImageGeneration,
            } = usePresentationState.getState();

            startRootImageGeneration('slide-1', 'query-1');
            startRootImageGeneration('slide-2', 'query-2');
            startRootImageGeneration('slide-3', 'query-3');

            completeRootImageGeneration('slide-1', 'https://example.com/image-1.png');
            failRootImageGeneration('slide-2', 'Generation failed');
            // slide-3 保持pending

            const currentState = usePresentationState.getState().rootImageGeneration;
            expect(currentState['slide-1']?.status).toBe('success');
            expect(currentState['slide-2']?.status).toBe('error');
            expect(currentState['slide-3']?.status).toBe('pending');
        });
    });

    describe('Presentation元数据管理', () => {
        it('should set current presentation', () => {
            const { setCurrentPresentation, currentPresentationId, currentPresentationTitle } =
                usePresentationState.getState();

            setCurrentPresentation('pres-123', 'AI培训课程');

            expect(usePresentationState.getState().currentPresentationId).toBe('pres-123');
            expect(usePresentationState.getState().currentPresentationTitle).toBe('AI培训课程');
        });

        it('should preserve presentationId during state updates', () => {
            const { setCurrentPresentation, setSlides } = usePresentationState.getState();

            setCurrentPresentation('pres-123', 'AI培训课程');
            setSlides(sampleTrainingPresentation);

            // 验证presentationId没有丢失
            expect(usePresentationState.getState().currentPresentationId).toBe('pres-123');
        });
    });

    describe('生成状态标志', () => {
        it('should track outline generation state', () => {
            const state = usePresentationState.getState();

            expect(state.isGeneratingOutline).toBe(false);

            // 模拟开始生成大纲
            state.shouldStartOutlineGeneration = true;
            expect(usePresentationState.getState().shouldStartOutlineGeneration).toBe(true);
        });

        it('should track presentation generation state', () => {
            const state = usePresentationState.getState();

            expect(state.isGeneratingPresentation).toBe(false);

            // 模拟开始生成演示文稿
            state.shouldStartPresentationGeneration = true;
            expect(usePresentationState.getState().shouldStartPresentationGeneration).toBe(true);
        });
    });

    describe('大纲和搜索结果', () => {
        it('should set and retrieve outline', () => {
            const { setOutline, outline } = usePresentationState.getState();

            const testOutline = [
                '# AI培训',
                '## 基础概念',
                '## 实践应用',
            ];

            setOutline(testOutline);

            expect(usePresentationState.getState().outline).toEqual(testOutline);
        });

        it('should set and retrieve search results', () => {
            const { setSearchResults, searchResults } = usePresentationState.getState();

            const testResults = [
                {
                    query: 'AI training',
                    results: [
                        {
                            title: 'Test Result',
                            content: 'Test content',
                            url: 'https://example.com',
                        },
                    ],
                },
            ];

            setSearchResults(testResults);

            expect(usePresentationState.getState().searchResults).toEqual(testResults);
        });
    });

    describe('主题和配置', () => {
        it('should set theme', () => {
            const { setTheme, theme } = usePresentationState.getState();

            setTheme('nebula');

            expect(usePresentationState.getState().theme).toBe('nebula');
        });

        it('should set custom theme data', () => {
            const { setTheme, customThemeData } = usePresentationState.getState();

            const customTheme = {
                name: 'Custom Theme',
                primaryColor: '#ff0000',
                backgroundColor: '#ffffff',
            };

            setTheme('custom', customTheme as any);

            expect(usePresentationState.getState().theme).toBe('custom');
            expect(usePresentationState.getState().customThemeData).toEqual(customTheme);
        });

        it('should set language', () => {
            const { setLanguage } = usePresentationState.getState();

            setLanguage('zh-CN');

            expect(usePresentationState.getState().language).toBe('zh-CN');
        });
    });
});

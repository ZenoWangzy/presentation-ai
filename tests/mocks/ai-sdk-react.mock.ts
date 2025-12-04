/**
 * Mock for @ai-sdk/react
 * 用于测试PresentationGenerationManager组件
 */

import { vi } from 'vitest';

export const mockUseChat = vi.fn(() => ({
    messages: [],
    append: vi.fn(),
    reload: vi.fn(),
    stop: vi.fn(),
    isLoading: false,
    error: undefined,
    data: [],
}));

export const mockUseCompletion = vi.fn(() => ({
    completion: '',
    complete: vi.fn(),
    isLoading: false,
    error: undefined,
    stop: vi.fn(),
}));

// 为vitest mock系统设置默认导出
export default {
    useChat: mockUseChat,
    useCompletion: mockUseCompletion,
};

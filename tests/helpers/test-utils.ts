/**
 * 测试辅助工具函数
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * 自定义render函数，包含常用的providers
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { ...options });
}

/**
 * 等待指定时间
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 模拟延迟函数
 */
export const mockDelay = (ms: number = 100) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 生成mock文件对象
 */
export const createMockFile = (
    name: string = 'test.png',
    size: number = 1024,
    type: string = 'image/png'
): File => {
    const blob = new Blob(['mock file content'], { type });
    return new File([blob], name, { type });
};

/**
 * 创建mock ReadableStream用于测试流式响应
 */
export const createMockReadableStream = (chunks: string[]): ReadableStream<Uint8Array> => {
    const encoder = new TextEncoder();
    let index = 0;

    return new ReadableStream({
        pull(controller) {
            if (index < chunks.length) {
                controller.enqueue(encoder.encode(chunks[index]));
                index++;
            } else {
                controller.close();
            }
        },
    });
};

/**
 * 断言错误被抛出（用于async函数）
 */
export const expectToThrow = async (fn: () => Promise<any>, errorMessage?: string) => {
    try {
        await fn();
        throw new Error('Expected function to throw, but it did not');
    } catch (error) {
        if (errorMessage && error instanceof Error) {
            expect(error.message).toContain(errorMessage);
        }
    }
};

/**
 * Mock console方法（避免测试输出污染）
 */
export const mockConsole = () => {
    const originalConsole = { ...console };

    beforeEach(() => {
        global.console = {
            ...console,
            log: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            info: vi.fn(),
        } as any;
    });

    afterEach(() => {
        global.console = originalConsole;
    });
};

// 重新导出常用的testing-library工具
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

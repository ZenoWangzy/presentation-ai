import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';
import { loadEnvConfig } from '@next/env';

// 加载测试环境变量
const projectDir = process.cwd();
loadEnvConfig(projectDir, true, { error: console.error, info: () => { } });

// 或者手动加载.env.test文件
if (process.env.NODE_ENV === 'test') {
    // 可以使用dotenv加载.env.test
    // require('dotenv').config({ path: '.env.test' });
}

// 启动MSW服务器
beforeAll(() => {
    server.listen({
        onUnhandledRequest: 'warn', // 警告未处理的请求
    });
});

// 每个测试后重置handlers
afterEach(() => {
    server.resetHandlers();
    cleanup(); // 清理React组件
});

// 测试结束后关闭MSW服务器
afterAll(() => {
    server.close();
});

// Mock environment variables for tests
// Note: NODE_ENV is read-only in some environments, set via vitest config instead


// Global test utilities - Mock浏览器API
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn(() => []),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Suppress console warnings in tests (optional)
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
    console.warn = vi.fn((...args) => {
        // Filter out known warnings
        const message = args[0];
        if (
            typeof message === 'string' &&
            (message.includes('ReactDOM.render') ||
                message.includes('Not implemented'))
        ) {
            return;
        }
        originalWarn(...args);
    });

    console.error = vi.fn((...args) => {
        // Filter out known errors
        const message = args[0];
        if (
            typeof message === 'string' &&
            message.includes('Not implemented')
        ) {
            return;
        }
        originalError(...args);
    });
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});

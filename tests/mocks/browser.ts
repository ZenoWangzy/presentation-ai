/**
 * MSW 浏览器Worker配置
 * 用于浏览器环境的测试（E2E测试、Playwright测试）
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 创建MSW浏览器worker实例
export const worker = setupWorker(...handlers);

// 在开发环境中启动worker（可选）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // 可以在开发环境启用MSW查看mock效果
    // worker.start();
}

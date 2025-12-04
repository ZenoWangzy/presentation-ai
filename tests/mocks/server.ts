/**
 * MSW Node服务器配置
 * 用于Node环境的测试（单元测试、集成测试、API测试）
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// 创建MSW服务器实例
export const server = setupServer(...handlers);

// 辅助函数：重置handlers到初始状态
export const resetHandlers = () => {
    server.resetHandlers();
};

// 辅助函数：添加一次性handler
export const addHandler = (...newHandlers: Parameters<typeof server.use>) => {
    server.use(...newHandlers);
};

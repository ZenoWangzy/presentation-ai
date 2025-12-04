import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        // 默认环境设置为happy-dom（用于React组件测试）
        environment: 'happy-dom',

        // 启用全局测试API（describe, it, expect等）
        globals: true,

        // 设置文件
        setupFiles: ['./tests/setup.ts'],

        // 包含的测试文件
        include: [
            'tests/**/*.test.ts',
            'tests/**/*.test.tsx',
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
        ],

        // 排除的目录
        exclude: [
            'node_modules',
            '.next',
            'tests/e2e', // E2E测试由Playwright处理
            'coverage',
        ],

        // 覆盖率配置
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.ts',
                'src/**/*.test.tsx',
                'src/**/types.ts',
                'src/**/types/*.ts',
                'src/env.js',
                'src/app/layout.tsx',
                'src/app/**/layout.tsx',
            ],
            // 临时关闭最低覆盖率要求，逐步提升
            // thresholds: {
            //     lines: 20,
            //     functions: 20,
            //     branches: 20,
            //     statements: 20,
            // },
        },

        // 环境特定配置
        environmentOptions: {
            happyDOM: {
                // Happy DOM配置
            },
        },

        // 假定时钟配置（确保时间相关测试稳定）
        fakeTimers: {
            toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
        },

        // 测试超时时间
        testTimeout: 10000,
        hookTimeout: 10000,
    },

    // 路径别名
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '~': path.resolve(__dirname, './'),
        },
    },

    // 环境变量配置
    define: {
        'process.env.NODE_ENV': JSON.stringify('test'),
    },
});

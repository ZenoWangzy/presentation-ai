/**
 * Playwright全局setup
 * 在所有测试开始前执行一次
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('Starting Playwright global setup...');

    // 可以在这里执行全局初始化
    // 例如：启动数据库、创建测试用户session等

    // 示例：创建认证状态（如果测试需要登录）
    // const browser = await chromium.launch();
    // const page = await browser.newPage();
    // 执行登录操作...
    // await page.context().storageState({ path: 'storageState.json' });
    // await browser.close();

    console.log('Playwright global setup completed');
}

export default globalSetup;

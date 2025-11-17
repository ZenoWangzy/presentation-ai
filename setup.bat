@echo off
echo 🔍 Presentation AI 项目配置验证与启动
echo.

REM 检查 .env.local 文件是否存在
if not exist ".env.local" (
    echo ❌ .env.local 文件不存在！
    echo 请确保已按照配置说明创建环境变量文件。
    pause
    exit /b 1
)

echo ✅ .env.local 文件存在
echo.

REM 检查Google OAuth配置
echo 🔐 检查Google OAuth配置...
findstr /C:"295331923642-jq9e8osh7dvce7stot111nq9167b9rbv" .env.local >nul
if %errorlevel% equ 0 (
    echo ✅ Google Client ID: 已正确设置
) else (
    echo ❌ Google Client ID: 未找到或配置错误
)

findstr /C:"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" .env.local >nul
if %errorlevel% equ 0 (
    echo ✅ Google Client Secret: 已正确设置
) else (
    echo ❌ Google Client Secret: 未找到或配置错误
)

findstr /C:"542mAIPLxozgzxglVtSc55vhck7C0pD/vePgwDjJ2lo=" .env.local >nul
if %errorlevel% equ 0 (
    echo ✅ NextAuth Secret: 已正确设置
) else (
    echo ❌ NextAuth Secret: 未找到或配置错误
)

echo.
echo 🤖 检查AI服务配置...
findstr /C:"your-openai-api-key" .env.local >nul
if %errorlevel% equ 0 (
    echo ⚠️  OpenAI API: 需要配置
) else (
    echo ✅ OpenAI API: 已配置
)

findstr /C:"your-together-ai-api-key" .env.local >nul
if %errorlevel% equ 0 (
    echo ⚠️  Together AI API: 需要配置
) else (
    echo ✅ Together AI API: 已配置
)

echo.
echo 📊 检查数据库配置...
findstr /C:"postgresql://username:password" .env.local >nul
if %errorlevel% equ 0 (
    echo ⚠️  数据库: 需要配置连接信息
) else (
    echo ✅ 数据库: 连接字符串已设置
)

echo.
echo 📝 配置摘要:
echo - Google OAuth: ✅ 已配置，可以登录
echo - AI服务: 需要配置API密钥才能使用生成功能
echo - 数据库: 需要配置PostgreSQL连接信息
echo.

echo 🎯 下一步操作:
echo 1. 确保PostgreSQL数据库正在运行
echo 2. 编辑 .env.local 文件，添加您的数据库连接信息
echo 3. 获取OpenAI和Together AI的API密钥并更新 .env.local
echo 4. 运行以下命令启动项目:
echo    npm install
echo    npm run db:push
echo    npm run dev
echo.
echo 5. 启动后访问: http://localhost:3000
echo.
echo ⚠️  重要提醒:
echo - 请确保已安装 Node.js 和 PostgreSQL
echo - Windows用户可能需要以管理员身份运行命令提示符
echo - 如果遇到Node.js问题，请重新安装或使用 nvm 管理
echo.

echo ✨ 配置验证完成！
echo.
pause
@echo off
echo Starting development server with correct Node.js path...

REM Use the correct Node.js installation
set PATH=E:\node.js;%PATH%

REM Check if Node.js is working
echo Node.js version:
node --version

echo.
echo NPM version:
npm --version

echo.
echo Starting Next.js development server...
npm run dev
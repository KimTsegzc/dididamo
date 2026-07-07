@echo off
chcp 65001 >nul
echo.
echo 停止 MotoFlow 服务中...
echo.
node launcher.js stop
echo.
pause

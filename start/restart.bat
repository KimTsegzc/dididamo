@echo off
chcp 65001 >nul
echo.
echo 重启 MotoFlow 服务中...
echo.
node launcher.js restart
echo.
pause

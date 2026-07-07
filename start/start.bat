@echo off
chcp 65001 >nul
title MotoFlow 服务启动器
echo.
echo 启动 MotoFlow 服务...
echo.
node launcher.js start
echo.
echo 服务已启动！按任意键打开浏览器...
pause >nul
start http://localhost:4173

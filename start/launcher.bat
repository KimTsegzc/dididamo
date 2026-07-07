@echo off
chcp 65001 >nul
cls

:menu
echo.
echo ╔════════════════════════════════════╗
echo ║   MotoFlow 服务启动器控制面板      ║
echo ╚════════════════════════════════════╝
echo.
echo 1. 启动服务
echo 2. 停止服务
echo 3. 重启服务
echo 4. 查看状态
echo 5. 打开浏览器访问
echo 0. 退出
echo.
set /p choice="请选择操作 (0-5): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto open
if "%choice%"=="0" goto exit
goto menu

:start
echo.
echo 正在启动服务...
node launcher.js start
timeout /t 2 /nobreak
goto menu

:stop
echo.
echo 正在停止服务...
node launcher.js stop
timeout /t 1 /nobreak
goto menu

:restart
echo.
echo 正在重启服务...
node launcher.js restart
timeout /t 3 /nobreak
goto menu

:status
echo.
node launcher.js status
echo.
pause
goto menu

:open
echo.
echo 正在打开浏览器...
start http://localhost:4173
timeout /t 1 /nobreak
goto menu

:exit
echo.
echo 再见！
timeout /t 1 /nobreak
exit /b 0

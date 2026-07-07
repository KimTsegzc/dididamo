#!/bin/bash

# MotoFlow 快速启动脚本 - Linux/Ubuntu 版本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER="$SCRIPT_DIR/launcher.sh"

echo ""
echo "启动 MotoFlow 服务..."
echo ""

bash "$LAUNCHER" start

echo ""
echo "按 Ctrl+C 停止服务"
tail -f /dev/null

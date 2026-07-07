#!/bin/bash

# MotoFlow 快速重启脚本 - Linux/Ubuntu 版本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER="$SCRIPT_DIR/launcher.sh"

echo ""
echo "重启 MotoFlow 服务中..."
echo ""

bash "$LAUNCHER" restart

echo ""

#!/bin/bash
# ECS 部署和启动脚本

set -e

PROJECT_PATH="${1:-.}"
PORT=4173

echo "=========================================="
echo "MotoFlow ECS 部署脚本"
echo "=========================================="
echo "项目路径: $PROJECT_PATH"
echo "监听端口: $PORT"
echo ""

cd "$PROJECT_PATH" || exit 1

echo "[1/4] 停止现有服务..."
pkill -f 'node server.js' || true
sleep 2

echo "[2/4] 清理旧日志..."
rm -f app.log nohup.out

echo "[3/4] 启动新服务..."
chmod +x start/*.sh 2>/dev/null || true
nohup node server.js >> app.log 2>&1 &
MAIN_PID=$!
echo "  └─ 进程 PID: $MAIN_PID"
sleep 2

echo "[4/4] 检查服务状态..."
SUCCESS=0
for i in {1..30}; do
  if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    echo "  ✅ 服务已就绪 (http://localhost:$PORT)"
    SUCCESS=1
    break
  fi
  echo "  ⏳ 等待中... ($i/30)"
  sleep 1
done

if [ $SUCCESS -eq 1 ]; then
  echo ""
  echo "=========================================="
  echo "✅ 部署完成！"
  echo "=========================================="
  echo "访问地址: http://$HOSTNAME:$PORT"
  echo "日志文件: $PROJECT_PATH/app.log"
  echo ""
  exit 0
else
  echo ""
  echo "=========================================="
  echo "❌ 部署失败！"
  echo "=========================================="
  echo "请检查日志: cat $PROJECT_PATH/app.log"
  echo ""
  exit 1
fi

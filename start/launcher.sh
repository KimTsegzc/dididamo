#!/bin/bash

# MotoFlow 服务启动器 - Linux/Ubuntu 版本

PID_FILE="$(dirname "$0")/.server-pid.txt"
PORT=4173
SERVER_DIR="$(dirname "$0")/.."

# 颜色代码
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 保存PID到文件
save_pid() {
    echo "$1" > "$PID_FILE"
}

# 读取保存的PID
read_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    fi
}

# 删除PID文件
delete_pid() {
    rm -f "$PID_FILE"
}

# 检查端口是否被占用
check_port_in_use() {
    nc -z localhost $PORT 2>/dev/null
    return $?
}

# 启动服务
start_server() {
    if check_port_in_use; then
        echo -e "${RED}❌ 服务已在运行！(端口 $PORT)${NC}"
        return 1
    fi

    echo -e "${BLUE}🚀 正在启动服务...${NC}"
    
    cd "$SERVER_DIR"
    nohup node server.js > /dev/null 2>&1 &
    local new_pid=$!
    save_pid $new_pid
    
    sleep 1
    if check_port_in_use; then
        echo -e "${GREEN}✅ 服务已启动！(PID: $new_pid)${NC}"
        echo -e "${BLUE}📍 访问地址: http://localhost:$PORT${NC}"
        return 0
    else
        echo -e "${RED}❌ 启动失败！${NC}"
        delete_pid
        return 1
    fi
}

# 停止服务
stop_server() {
    if ! check_port_in_use; then
        echo -e "${YELLOW}⚠️  服务未在运行${NC}"
        delete_pid
        return 0
    fi

    local pid=$(read_pid)
    if [ -n "$pid" ]; then
        kill -TERM $pid 2>/dev/null
        sleep 1
        if ! kill -0 $pid 2>/dev/null; then
            echo -e "${GREEN}✅ 服务已停止！(PID: $pid)${NC}"
            delete_pid
            return 0
        fi
        # 如果进程仍在运行，使用 KILL
        kill -9 $pid 2>/dev/null
        echo -e "${GREEN}✅ 服务已强制停止！(PID: $pid)${NC}"
        delete_pid
        return 0
    else
        # 使用lsof查找占用端口的进程
        local port_pid=$(lsof -ti:$PORT 2>/dev/null)
        if [ -n "$port_pid" ]; then
            kill -9 $port_pid 2>/dev/null
            echo -e "${GREEN}✅ 服务已停止！(PID: $port_pid)${NC}"
            delete_pid
            return 0
        fi
    fi
}

# 重启服务
restart_server() {
    echo -e "${BLUE}🔄 正在重启服务...${NC}"
    stop_server
    sleep 2
    start_server
}

# 显示状态
status_server() {
    if check_port_in_use; then
        local pid=$(read_pid)
        echo -e "${GREEN}✅ 服务运行中${NC}"
        echo -e "${BLUE}   📍 地址: http://localhost:$PORT${NC}"
        echo -e "${BLUE}   🔢 PID: ${pid:-未知}${NC}"
    else
        echo -e "${RED}❌ 服务未运行${NC}"
    fi
}

# 显示帮助
show_help() {
    cat << 'EOF'

╔════════════════════════════════════════╗
║     MotoFlow 服务启动器 v1.0 (Linux)   ║
╚════════════════════════════════════════╝

用法: ./launcher.sh [command]

命令:
  start    启动服务
  stop     停止服务
  restart  重启服务
  status   查看服务状态
  help     显示此帮助信息

示例:
  ./launcher.sh start
  ./launcher.sh restart

EOF
}

# 主程序
case "${1:-help}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    help)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac

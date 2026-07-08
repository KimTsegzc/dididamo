#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LAUNCHER="$ROOT_DIR/start/tools/launcher.root.js"

case "${1:-restart}" in
  start|stop|restart|status)
    node "$LAUNCHER" "$1"
    ;;
  *)
    echo "用法: bash start/deploy.sh [start|stop|restart|status]"
    exit 1
    ;;
esac

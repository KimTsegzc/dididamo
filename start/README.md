# MotoFlow 启动脚本文档

## 目录结构

```
start/
├── launcher.js          # 核心 Node.js 脚本（跨平台）
├── launcher.bat         # Windows 交互式菜单
├── start.bat            # Windows 快速启动
├── stop.bat             # Windows 快速停止
├── restart.bat          # Windows 快速重启
├── launcher.sh          # Linux/Ubuntu 核心脚本
├── start.sh             # Linux/Ubuntu 快速启动
├── stop.sh              # Linux/Ubuntu 快速停止
├── restart.sh           # Linux/Ubuntu 快速重启
└── README.md            # 本文件
```

## Windows 用法

### 方式1：使用交互式菜单（推荐）
双击 `launcher.bat`，进入菜单选择：
- 1: 启动服务
- 2: 停止服务
- 3: 重启服务
- 4: 查看状态
- 5: 打开浏览器

### 方式2：快速操作
- 双击 `start.bat` - 启动服务
- 双击 `stop.bat` - 停止服务
- 双击 `restart.bat` - 重启服务

### 方式3：命令行
```bash
node launcher.js start
node launcher.js stop
node launcher.js restart
node launcher.js status
```

## Linux/Ubuntu 用法

### 方式1：使用交互式菜单
```bash
bash launcher.sh
```

### 方式2：快速操作
```bash
bash start.sh      # 启动服务
bash stop.sh       # 停止服务
bash restart.sh    # 重启服务
```

### 方式3：直接命令
```bash
node launcher.js start
node launcher.js stop
node launcher.js restart
node launcher.js status
```

### 赋予执行权限（首次使用）
```bash
chmod +x launcher.sh start.sh stop.sh restart.sh
./launcher.sh start
./start.sh
./stop.sh
./restart.sh
```

## CI/CD 集成

### GitHub Actions 示例
```yaml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: bash start/launcher.sh restart
```

### Docker 中使用
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN chmod +x start/*.sh
EXPOSE 4173
CMD ["bash", "start/launcher.sh", "start"]
```

## 功能特性

- ✅ 自动检测端口占用
- ✅ 自动管理进程 PID
- ✅ 跨平台支持（Windows/Linux）
- ✅ 友好的交互界面
- ✅ CI/CD 集成就绪
- ✅ 进程守护（后台运行）

## 故障排除

### Windows
- 若 .bat 文件无反应，检查是否已安装 Node.js
- 若关闭失败，可能需要以管理员身份运行
- 可以手动用 `taskkill` 清理进程：`taskkill /F /IM node.exe`

### Linux/Ubuntu
- 确保已安装 Node.js 和 nc/netcat（用于端口检测）
- `bash launcher.sh` 发生权限问题时，运行 `chmod +x *.sh`
- 若需要后台运行，使用 `nohup bash start.sh &`

## 常见问题

**Q: 端口 4173 被占用了怎么办？**
```bash
# Windows
netstat -ano | findstr :4173

# Linux
lsof -i :4173
```

**Q: 如何看实时日志？**
```bash
# Linux
tail -f nohup.out

# Windows
node launcher.js start  # 移除 stdio: "inherit" 改为继承标准输出
```

# MotoFlow 启动脚本文档

## 目录结构

```
start/
├── launcher.bat         # Windows 交互式菜单
├── start.bat            # Windows 快速启动
├── stop.bat             # Windows 快速停止
├── restart.bat          # Windows 快速重启
├── launcher.sh          # Linux/Ubuntu 核心脚本
├── start.sh             # Linux/Ubuntu 快速启动
├── stop.sh              # Linux/Ubuntu 快速停止
├── restart.sh           # Linux/Ubuntu 快速重启
├── deploy.sh            # Linux/Ubuntu 部署入口
├── tools/
│   ├── launcher.root.js # 旧版 Node 启动器收纳版
│   └── deploy.sh        # 旧版部署脚本收纳版
└── README.md            # 本文件
```

## Windows 用法

### 方式1：使用交互式菜单（推荐）
双击 `launcher.bat`，进入菜单选择：
- 1: 启动服务
- 2: 停止服务
- 3: 重启服务
- 4: 查看状态
- 5: 打开业务首页
- 6: 打开 TCMapApi 中心

### 方式2：快速操作
- 双击 `start.bat` - 启动服务
- 双击 `stop.bat` - 停止服务
- 双击 `restart.bat` - 重启服务

### 方式3：命令行
```bash
node start/tools/launcher.root.js start
node start/tools/launcher.root.js stop
node start/tools/launcher.root.js restart
node start/tools/launcher.root.js status
```

## Linux/Ubuntu 用法

### 方式1：使用交互式菜单
```bash
bash start/launcher.sh
```

### 方式2：快速操作
```bash
bash start/start.sh      # 启动服务
bash start/stop.sh       # 停止服务
bash start/restart.sh    # 重启服务
bash start/deploy.sh     # 部署入口
```

### 方式3：直接命令
```bash
node start/tools/launcher.root.js start
node start/tools/launcher.root.js stop
node start/tools/launcher.root.js restart
node start/tools/launcher.root.js status
```

## 访问入口

- 业务首页：`http://<host>:4173/`
- TCMapApi 中心：`http://<host>:4173/TCMapApi/`
- TCMapApi 接口测试：`http://<host>:4173/TCMapApi/pages/api-check.html`

## 腾讯配置

- key 存放于 `backend/config/runtime.json`
- 前端只读取掩码状态
- 后端统一提供 `/api/tencent/*` 代理接口

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
tail -f app.log
```

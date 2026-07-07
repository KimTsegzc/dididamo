const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const PID_FILE = path.join(__dirname, ".server-pid.txt");
const PORT = 4173;

// 保存PID到文件
function savePID(pid) {
  fs.writeFileSync(PID_FILE, pid.toString());
}

// 读取保存的PID
function readPID() {
  if (fs.existsSync(PID_FILE)) {
    return fs.readFileSync(PID_FILE, "utf-8").trim();
  }
  return null;
}

// 删除PID文件
function deletePID() {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

// 检查端口是否被占用
function checkPortInUse() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, () => {
      resolve(true);
    });
    req.on("error", () => {
      resolve(false);
    });
    setTimeout(() => resolve(false), 1000);
  });
}

// 启动服务
async function startServer() {
  const isRunning = await checkPortInUse();
  if (isRunning) {
    console.log(`❌ 服务已在运行！(端口 ${PORT})`);
    return;
  }

  console.log("🚀 正在启动服务...");
  const server = spawn("node", ["server.js"], {
    cwd: __dirname,
    stdio: "inherit",
    detached: true
  });

  savePID(server.pid);
  console.log(`✅ 服务已启动！(PID: ${server.pid})`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  
  server.unref();
}

// 停止服务
async function stopServer() {
  const isRunning = await checkPortInUse();
  if (!isRunning) {
    console.log("⚠️  服务未在运行");
    deletePID();
    return;
  }

  if (process.platform === "win32") {
    // Windows 系统
    exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
      if (stdout) {
        const pid = stdout.trim().split(/\s+/).pop();
        exec(`taskkill /PID ${pid} /F`, () => {
          console.log("✅ 服务已停止！");
          deletePID();
        });
      }
    });
  } else {
    // Unix/Linux/Mac 系统
    const pid = readPID();
    if (pid) {
      process.kill(-pid, "SIGTERM");
      console.log(`✅ 服务已停止！(PID: ${pid})`);
      deletePID();
    }
  }
}

// 重启服务
async function restartServer() {
  console.log("🔄 正在重启服务...");
  await stopServer();
  
  // 等待2秒后重新启动
  setTimeout(() => {
    startServer();
  }, 2000);
}

// 显示状态
async function statusServer() {
  const isRunning = await checkPortInUse();
  const pid = readPID();
  
  if (isRunning) {
    console.log(`✅ 服务运行中`);
    console.log(`   📍 地址: http://localhost:${PORT}`);
    console.log(`   🔢 PID: ${pid || "未知"}`);
  } else {
    console.log("❌ 服务未运行");
  }
}

// 显示帮助
function showHelp() {
  console.log(`
╔════════════════════════════════════════╗
║        MotoFlow 服务启动器 v1.0        ║
╚════════════════════════════════════════╝

用法: node launcher.js [command]

命令:
  start    启动服务
  stop     停止服务
  restart  重启服务
  status   查看服务状态
  help     显示此帮助信息

示例:
  node launcher.js start
  node launcher.js restart

`);
}

// 主程序
const command = process.argv[2] || "help";

switch (command.toLowerCase()) {
  case "start":
    startServer();
    break;
  case "stop":
    stopServer();
    break;
  case "restart":
    restartServer();
    break;
  case "status":
    statusServer();
    break;
  case "help":
  default:
    showHelp();
}

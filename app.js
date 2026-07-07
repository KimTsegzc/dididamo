window.GAODE_API_KEY = window.GAODE_API_KEY || "";

const state = {
  role: "passenger",
  index: 0,
  user: {
    passenger: { name: "乘客-阿杰", phone: "13800001234", loggedIn: false },
    driver: { name: "司机-老陈", phone: "13900006688", loggedIn: false, online: false },
    admin: { name: "平台管理员", phone: "admin", loggedIn: false }
  },
  order: {
    id: "MO20260705001",
    from: "万达广场北门",
    to: "高铁站东广场",
    status: "idle",
    eta: 8,
    fee: 26,
    distance: 6.2,
    duration: 18,
    driver: "老陈",
    passenger: "阿杰"
  },
  pricing: { base: 6, perKm: 2.4 },
  finance: {
    walletPassenger: 128.4,
    walletDriver: 380.6,
    todayIncome: 1280,
    totalOrders: 43,
    onlineDrivers: 12
  }
};

const roleCircle = ["passenger", "driver", "admin"];
const roleName = { passenger: "乘客端", driver: "司机端", admin: "后台端" };

const roleTabs = {
  passenger: [
    { id: "home", text: "打车" },
    { id: "trip", text: "行程" },
    { id: "orders", text: "订单" },
    { id: "me", text: "我的" }
  ],
  driver: [
    { id: "desk", text: "工作台" },
    { id: "todo", text: "接单" },
    { id: "wallet", text: "钱包" },
    { id: "history", text: "历史" }
  ],
  admin: [
    { id: "dash", text: "看板" },
    { id: "users", text: "用户" },
    { id: "orders", text: "订单" },
    { id: "setting", text: "设置" }
  ]
};

function badge(status) {
  const map = {
    idle: ["待下单", "info"],
    waiting: ["等待接单", "warn"],
    accepted: ["司机已接单", "info"],
    ontrip: ["行程中", "warn"],
    completed: ["已完成", "ok"],
    cancelled: ["已取消", "warn"]
  };
  const x = map[status] || [status, "info"];
  return `<span class="badge ${x[1]}">${x[0]}</span>`;
}

function mapBox(note) {
  return `
    <div class="map">
      <div>
        <div><strong>高德地图占位</strong></div>
        <div class="muted">KEY: ${window.GAODE_API_KEY || "未配置"}</div>
        <div class="muted">${note}</div>
      </div>
    </div>
  `;
}

function setOrder(status) {
  const prev = state.order.status;
  state.order.status = status;
  if (status === "completed" && prev !== "completed") {
    state.finance.walletDriver += state.order.fee;
    state.finance.walletPassenger -= state.order.fee;
    state.finance.todayIncome += state.order.fee;
    state.finance.totalOrders += 1;
  }
  render();
}

function switchRole() {
  const i = roleCircle.indexOf(state.role);
  state.role = roleCircle[(i + 1) % roleCircle.length];
  state.index = 0;
  render();
}

function setTab(i) {
  state.index = i;
  render();
}

function mockLogin() {
  state.user[state.role].loggedIn = true;
  alert(`${roleName[state.role]}已登录（演示）`);
  render();
}

function mockLogout() {
  state.user[state.role].loggedIn = false;
  alert(`${roleName[state.role]}已退出（演示）`);
  render();
}

function payNow() {
  const btn = document.getElementById("payBtn");
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = "支付处理中...";
  setTimeout(() => {
    alert("支付成功（假支付），无真实资金流转");
    btn.disabled = false;
    btn.textContent = "完成假支付";
    state.index = 2;
    render();
  }, 1000);
}

function savePricing() {
  const base = Number(document.getElementById("basePrice").value);
  const perKm = Number(document.getElementById("kmPrice").value);
  if (Number.isFinite(base)) state.pricing.base = base;
  if (Number.isFinite(perKm)) state.pricing.perKm = perKm;
  state.order.fee = Number((state.pricing.base + state.order.distance * state.pricing.perKm).toFixed(1));
  alert("计价规则已更新（演示）");
  render();
}

function saveAdminKey() {
  const val = document.getElementById("adminGaode").value.trim();
  window.GAODE_API_KEY = val;
  document.getElementById("gaodeKeyInput").value = val;
  render();
}

function passengerScreen(tab) {
  if (!state.user.passenger.loggedIn) {
    return `
      <section class="card">
        <h3 class="title">乘客登录</h3>
        <div class="muted">手机号验证码登录（模拟）</div>
        <label>手机号<input value="${state.user.passenger.phone}" /></label>
        <label>验证码<input placeholder="123456" /></label>
        <button class="btn" onclick="mockLogin()">登录</button>
      </section>
    `;
  }

  if (tab === "home") {
    return `
      <section class="card">
        <h3 class="title">首页打车</h3>
        ${mapBox("起点/终点选择与路线渲染预留")}
        <div class="row"><span>起点</span><strong>${state.order.from}</strong></div>
        <div class="row"><span>终点</span><strong>${state.order.to}</strong></div>
        <div class="row"><span>预估费用</span><strong>${state.order.fee} 元</strong></div>
        <div class="actions">
          <button class="btn" onclick="setOrder('waiting')">呼叫司机</button>
          <button class="btn alt" onclick="setOrder('cancelled')">取消</button>
        </div>
      </section>
    `;
  }

  if (tab === "trip") {
    if (state.order.status === "waiting") {
      return `
        <section class="card">
          <h3 class="title">呼叫等待</h3>
          ${mapBox("等待司机接单中")}
          <p>状态：${badge(state.order.status)}</p>
          <div class="actions">
            <button class="btn" onclick="setOrder('accepted')">模拟司机接单</button>
            <button class="btn alt" onclick="setOrder('cancelled')">取消订单</button>
          </div>
        </section>
      `;
    }
    if (state.order.status === "accepted" || state.order.status === "ontrip") {
      return `
        <section class="card">
          <h3 class="title">行程进行中</h3>
          ${mapBox("司机与乘客位置同步（模拟）")}
          <div class="row"><span>司机</span><strong>${state.order.driver}</strong></div>
          <div class="row"><span>距离</span><strong>${state.order.distance} km</strong></div>
          <div class="row"><span>时长</span><strong>${state.order.duration} 分钟</strong></div>
          <button class="btn" onclick="setOrder('completed')">结束行程</button>
        </section>
      `;
    }
    if (state.order.status === "completed") {
      return `
        <section class="card">
          <h3 class="title">模拟结算支付</h3>
          <p>订单 ${state.order.id}</p>
          <p>应付金额 <strong>${state.order.fee} 元</strong></p>
          <p class="muted">仅演示假支付，不调用真实支付渠道</p>
          <button id="payBtn" class="btn" onclick="payNow()">完成假支付</button>
        </section>
      `;
    }
    return `
      <section class="card">
        <h3 class="title">暂无进行中行程</h3>
        <p class="muted">先在“打车”页发起订单</p>
      </section>
    `;
  }

  if (tab === "orders") {
    return `
      <section class="card">
        <h3 class="title">订单列表</h3>
        <div class="row"><span>${state.order.id}</span>${badge(state.order.status)}</div>
        <div class="row"><span>MO20260704016</span><span class="badge ok">已完成</span></div>
        <div class="row"><span>MO20260704011</span><span class="badge warn">已取消</span></div>
      </section>
    `;
  }

  return `
    <section class="card">
      <h3 class="title">个人中心</h3>
      <p>昵称：${state.user.passenger.name}</p>
      <p>虚拟钱包：${state.finance.walletPassenger.toFixed(2)} 元</p>
      <button class="btn alt" onclick="mockLogout()">退出登录</button>
    </section>
  `;
}

function driverScreen(tab) {
  if (!state.user.driver.loggedIn) {
    return `
      <section class="card">
        <h3 class="title">司机登录</h3>
        <label>手机号<input value="${state.user.driver.phone}" /></label>
        <label>验证码<input placeholder="123456" /></label>
        <button class="btn" onclick="mockLogin()">登录</button>
      </section>
    `;
  }

  if (tab === "desk") {
    return `
      <section class="card">
        <h3 class="title">司机工作台</h3>
        ${mapBox("司机导航与接单状态")}
        <p>接单状态：${state.user.driver.online ? '<span class="badge ok">在线</span>' : '<span class="badge warn">离线</span>'}</p>
        <div class="actions">
          <button class="btn" onclick="state.user.driver.online=true; render()">上线接单</button>
          <button class="btn alt" onclick="state.user.driver.online=false; render()">下线休息</button>
        </div>
      </section>
    `;
  }

  if (tab === "todo") {
    return `
      <section class="card">
        <h3 class="title">新订单弹窗</h3>
        <p>${state.order.from} -> ${state.order.to}</p>
        <p>预估 ${state.order.fee} 元，${state.order.distance} km</p>
        <div class="actions">
          <button class="btn" onclick="setOrder('accepted')">接单</button>
          <button class="btn alt" onclick="setOrder('cancelled')">拒单</button>
        </div>
      </section>
      <section class="card">
        <h3 class="title">接驾 / 行程</h3>
        ${mapBox("导航到上车点与行程路线")}
        <div class="actions">
          <button class="btn" onclick="setOrder('ontrip')">开始行程</button>
          <button class="btn alt" onclick="setOrder('completed')">结束行程</button>
        </div>
      </section>
    `;
  }

  if (tab === "wallet") {
    return `
      <section class="card">
        <h3 class="title">司机虚拟钱包</h3>
        <p>虚拟余额：${state.finance.walletDriver.toFixed(2)} 元</p>
        <p>今日虚拟收入：${state.finance.todayIncome.toFixed(2)} 元</p>
        <button class="btn alt" onclick="alert('提现功能仅静态预留，三期实现')">提现入口（静态）</button>
      </section>
    `;
  }

  return `
    <section class="card">
      <h3 class="title">历史订单</h3>
      <div class="row"><span>MO20260704016</span><span class="badge ok">已完成</span></div>
      <div class="row"><span>MO20260704011</span><span class="badge warn">已取消</span></div>
      <button class="btn alt" onclick="mockLogout()">退出登录</button>
    </section>
  `;
}

function adminScreen(tab) {
  if (!state.user.admin.loggedIn) {
    return `
      <section class="card">
        <h3 class="title">后台管理员登录</h3>
        <label>管理员账号<input value="admin" /></label>
        <label>密码<input type="password" value="123456" /></label>
        <button class="btn" onclick="mockLogin()">登录后台</button>
      </section>
    `;
  }

  if (tab === "dash") {
    return `
      <section class="card">
        <h3 class="title">简易数据看板</h3>
        <div class="row"><span>实时订单总量</span><strong>${state.finance.totalOrders}</strong></div>
        <div class="row"><span>在线司机数</span><strong>${state.finance.onlineDrivers}</strong></div>
        <div class="row"><span>今日虚拟收入</span><strong>${state.finance.todayIncome.toFixed(2)} 元</strong></div>
      </section>
    `;
  }

  if (tab === "users") {
    return `
      <section class="card">
        <h3 class="title">乘客用户管理</h3>
        <div class="row"><span>阿杰</span><button class="chip">查看</button></div>
        <div class="row"><span>小丽</span><button class="chip">查看</button></div>
        <div class="row"><span>王南</span><button class="chip">查看</button></div>
      </section>
    `;
  }

  if (tab === "orders") {
    return `
      <section class="card">
        <h3 class="title">订单管理</h3>
        <label>状态筛选<select><option>全部</option><option>进行中</option><option>已完成</option></select></label>
        <div class="row"><span>${state.order.id}</span>${badge(state.order.status)}</div>
        <div class="row"><span>MO20260704016</span><span class="badge ok">已完成</span></div>
      </section>
    `;
  }

  return `
    <section class="card">
      <h3 class="title">系统设置</h3>
      <label>起步价<input id="basePrice" value="${state.pricing.base}" /></label>
      <label>里程单价<input id="kmPrice" value="${state.pricing.perKm}" /></label>
      <button class="btn" onclick="savePricing()">保存计价规则</button>
      <label>高德 KEY<input id="adminGaode" value="${window.GAODE_API_KEY}" /></label>
      <button class="btn alt" onclick="saveAdminKey()">保存地图 Key</button>
      <button class="btn alt" onclick="mockLogout()">退出后台</button>
    </section>
  `;
}

function renderTabs() {
  const tabs = roleTabs[state.role];
  const el = document.getElementById("mobileTabs");
  el.innerHTML = tabs
    .map((x, i) => `<button class="tab ${i === state.index ? "active" : ""}" onclick="setTab(${i})">${x.text}</button>`)
    .join("");
}

function renderView() {
  const tab = roleTabs[state.role][state.index].id;
  const view = document.getElementById("view");
  if (state.role === "passenger") view.innerHTML = passengerScreen(tab);
  if (state.role === "driver") view.innerHTML = driverScreen(tab);
  if (state.role === "admin") view.innerHTML = adminScreen(tab);
}

function renderMeta() {
  document.getElementById("roleLabel").textContent = `当前角色: ${roleName[state.role]}`;
  document.getElementById("statusLabel").textContent = `当前订单: ${state.order.id} / ${state.order.status}`;
}

function render() {
  renderTabs();
  renderView();
  renderMeta();
}

document.getElementById("roleSwitchBtn").addEventListener("click", switchRole);
document.getElementById("saveKeyBtn").addEventListener("click", () => {
  const key = document.getElementById("gaodeKeyInput").value.trim();
  window.GAODE_API_KEY = key;
  render();
  alert("高德 KEY 已更新到 window.GAODE_API_KEY（演示）");
});

document.getElementById("gaodeKeyInput").value = window.GAODE_API_KEY;
render();

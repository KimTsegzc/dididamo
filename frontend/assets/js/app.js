const state = {
  role: "passenger",
  index: 1,
  mapConfig: { enabled: false, keyMask: "" },
  addressPanelOpen: false,
  addressPanelMode: "to",
  origin: {
    status: "idle",
    address: "环球中心-E3(新世纪环球中心)东南侧",
    location: null,
    nearby: [],
    error: "",
    updatedAt: "",
    source: "browser-geolocation"
  },
  user: {
    passenger: { name: "乘客-阿杰", phone: "13800001234", loggedIn: true },
    driver: { name: "司机-老陈", phone: "13900006688", loggedIn: true, online: false },
    admin: { name: "平台管理员", phone: "admin", loggedIn: true }
  },
  order: {
    id: "MO20260705001",
    from: "环球中心-E3(新世纪环球中心)东南侧",
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

const addressBook = {
  recommended: [
    { title: "成都馨乐庭城南公寓酒店(大源国际中心)", subtitle: "四川省成都市武侯区天府三街88号", distance: "800m", icon: "hotel" },
    { title: "LAWSON罗森(峰汇中心店)", subtitle: "四川省成都市武侯区交子大道314号", distance: "329m", icon: "store" },
    { title: "成都大熊猫繁育研究基地", subtitle: "四川省成都市成华区熊猫大道1375号", distance: "22.7km", icon: "spot", tag: "确认下车点" }
  ],
  cities: [
    {
      name: "成都市",
      items: [
        { title: "成都馨乐庭城南公寓酒店(大源国际中心)", subtitle: "四川省成都市武侯区天府三街88号ICON大源国际中心", distance: "800m", icon: "hotel" },
        { title: "LAWSON罗森(峰汇中心店)", subtitle: "来自地图选点", distance: "304m", icon: "pin" }
      ]
    },
    {
      name: "广州市",
      items: [
        { title: "广州白云国际机场T2航站楼", subtitle: "广东省广州市花都区机场大道东888号广州白云国际机场", distance: "1214km", icon: "plane" },
        { title: "中鼎君和名城珺合府-南门", subtitle: "广东省广州市黄埔区香秀二街西南四百米", distance: "1246km", icon: "pin" },
        { title: "天河城-东门", subtitle: "广东省广州市天河区天河路208号天河城F1", distance: "1235km", icon: "pin" }
      ]
    }
  ]
};

const roleTabs = {
  passenger: [
    { id: "orders", text: "订单", icon: "ticket" },
    { id: "home", text: "叫车", icon: "moto" },
    { id: "me", text: "我的", icon: "me" }
  ],
  driver: [
    { id: "todo", text: "订单", icon: "ticket" },
    { id: "desk", text: "叫车", icon: "moto" },
    { id: "history", text: "我的", icon: "me" }
  ],
  admin: [
    { id: "orders", text: "订单", icon: "ticket" },
    { id: "dash", text: "叫车", icon: "moto" },
    { id: "setting", text: "我的", icon: "me" }
  ]
};

const tabIconSvg = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l8 6v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9l8-6z"/></svg>',
  driver: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 14c5 0 9 2.2 9 5v1H3v-1c0-2.8 4-5 9-5z"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7zm6 2h4v2h-4V9zm0 4h4v2h-4v-2z"/></svg>',
  me: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c4.4 0 8 2.2 8 5v1H4v-1c0-2.8 3.6-5 8-5z"/></svg>',
  moto: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 17a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 3.28 2.27h2.34l1.48-2.27H11V8h4.9a1 1 0 0 1 .84 1.55l-1.9 2.95h1.66A3.5 3.5 0 1 1 16.5 17h-10zM6.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10 0a1.5 1.5 0 1 0 .001 3.001A1.5 1.5 0 0 0 16.5 12z"/></svg>'
};

const mapRuntime = {
  bootstrap: null,
  sdkLoading: null,
  sdkUrl: "",
  map: null,
  mapContainerId: "",
  renderToken: 0
};

const DEMO_TENCENT_JS_KEY = "CSIBZ-OXWY3-MD23Q-RVESB-5CESS-YDBTD";
const DEBUG_MODE_KEY = "md_debug";
let DEBUG_MODE = (() => {
  try {
    const stored = localStorage.getItem(DEBUG_MODE_KEY);
    if (stored === null) {
      localStorage.setItem(DEBUG_MODE_KEY, "1");
      return true;
    }
    return stored === "1";
  } catch {
    return true;
  }
})();

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureDebugLogState() {
  if (!state.debugLogs) {
    state.debugLogs = [];
  }
}

function logDebug(message) {
  if (!DEBUG_MODE) return;
  ensureDebugLogState();
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  state.debugLogs.unshift(`[${time}] ${message}`);
  state.debugLogs = state.debugLogs.slice(0, 8);
}

function shortcutIconSvg(type) {
  const icons = {
    reserve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7a1 1 0 0 1 1 1v3.38l2.24 1.3a1 1 0 1 1-1 1.72l-2.74-1.58A1 1 0 0 1 11 13V8a1 1 0 0 1 1-1Zm0-5a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"/></svg>',
    helper: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-6 15c0-2.76 2.69-5 6-5s6 2.24 6 5v1H6v-1Zm11-8a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z"/></svg>'
  };
  return icons[type] || "";
}

function toggleDebugMode() {
  DEBUG_MODE = !DEBUG_MODE;
  try {
    localStorage.setItem(DEBUG_MODE_KEY, DEBUG_MODE ? "1" : "0");
  } catch {
    // ignore storage failures
  }
  render();
}

async function fetchTencentBootstrap() {
  if (mapRuntime.bootstrap) return mapRuntime.bootstrap;
  logDebug("拉取腾讯地图 bootstrap");
  const resp = await fetch("/api/tencent/bootstrap");
  if (!resp.ok) throw new Error("无法读取腾讯地图配置");
  mapRuntime.bootstrap = await resp.json();
  return mapRuntime.bootstrap;
}

async function loadTencentSdk() {
  const boot = await fetchTencentBootstrap();
  const sdkUrl = boot.keyReady && boot.jsApiUrl
    ? boot.jsApiUrl
    : `https://map.qq.com/api/gljs?v=1.exp&key=${encodeURIComponent(DEMO_TENCENT_JS_KEY)}`;

  if (window.TMap) return boot;
  if (mapRuntime.sdkLoading && mapRuntime.sdkUrl === sdkUrl) {
    await mapRuntime.sdkLoading;
    return boot;
  }

  mapRuntime.sdkUrl = sdkUrl;
  logDebug(`加载地图 SDK: ${boot.keyReady ? "线上 key" : "演示 key"}`);
  mapRuntime.sdkLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("腾讯地图 SDK 加载失败"));
    document.head.appendChild(script);
  });

  await mapRuntime.sdkLoading;
  if (!window.TMap) {
    throw new Error("腾讯地图 SDK 未正确初始化");
  }
  return boot;
}

function getMapScene() {
  const tab = roleTabs[state.role][state.index]?.id;
  if (state.role === "passenger" && state.order.pickupLocation) {
    const pickup = state.order.pickupLocation;
    return { lat: pickup.lat, lng: pickup.lng, zoom: 16, pitch: 26, rotation: 12 };
  }
  if (state.role === "passenger" && tab === "trip") {
    return { lat: 22.543096, lng: 114.057865, zoom: 13, pitch: 28, rotation: 8 };
  }
  if (state.role === "driver") {
    return { lat: 22.552023, lng: 114.093632, zoom: 12, pitch: 35, rotation: 15 };
  }
  return { lat: 22.543096, lng: 114.057865, zoom: 14, pitch: 30, rotation: 20 };
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      logDebug("浏览器不支持定位");
      reject(new Error("当前浏览器不支持定位"));
      return;
    }

    logDebug("请求浏览器定位权限");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        logDebug(`定位成功: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        resolve({
          lat: Number(position.coords.latitude),
          lng: Number(position.coords.longitude),
          accuracy: Number(position.coords.accuracy || 0)
        });
      },
      (error) => {
        logDebug(`定位失败: ${error.message || error.code}`);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
}

async function fetchPickupPointFromLocation(location) {
  logDebug("调用腾讯逆地址解析");
  const query = new URLSearchParams({
    location: `${location.lat},${location.lng}`,
    get_poi: "1",
    radius: "1200",
    poi_options: "policy=3;orderby=_distance;address_format=short"
  });
  const resp = await fetch(`/api/tencent/geo/regeo?${query.toString()}`);
  if (!resp.ok) {
    let detail = "逆地址解析失败";
    try {
      const data = await resp.json();
      detail = data?.message || data?.msg || data?.info || detail;
    } catch {
      // ignore parse failures
    }
    throw new Error(detail);
  }
  const data = await resp.json();
  const result = data?.data?.result || {};
  const address = result?.formatted_addresses?.recommend || result?.formatted_addresses?.standard_address || result?.address || result?.formatted_addresses?.rough || "当前位置";
  const pois = Array.isArray(result?.pois) ? result.pois.map((item) => ({
    title: item.title || "附近上车点",
    address: item.address || item._dir_desc || "",
    distance: typeof item._distance === "number" ? `${item._distance}m` : "",
    location: item.location || null,
    category: item.category || ""
  })) : [];
  logDebug(`逆地址完成: ${address}`);
  return {
    address,
    location,
    raw: result,
    pois
  };
}

async function fetchNearbyPickupPois(location) {
  const keywords = ["地铁站", "小区", "写字楼"];
  const boundary = `nearby(${location.lng},${location.lat},1200,1)`;
  logDebug("拉取附近上车点 POI");
  const requests = keywords.map(async (keyword) => {
    const query = new URLSearchParams({ keyword, boundary, page_size: "3", page_index: "1" });
    const resp = await fetch(`/api/tencent/search/poi?${query.toString()}`);
    if (!resp.ok) {
      return [];
    }
    const data = await resp.json();
    const list = data?.data?.data || [];
    return list.map((item) => ({
      title: item.title || item.name || "附近上车点",
      address: item.address || item.addr || "",
      category: keyword,
      location: item.location || null
    }));
  });

  const batches = await Promise.allSettled(requests);
  const merged = [];
  const seen = new Set();

  for (const batch of batches) {
    if (batch.status !== "fulfilled") continue;
    for (const item of batch.value) {
      const key = `${item.title}|${item.address}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  logDebug(`附近上车点返回 ${merged.length} 条`);
  return merged.slice(0, 6);
}

async function initPassengerPickup() {
  let location = null;
  try {
    state.origin.status = "locating";
    state.origin.error = "";
    logDebug("初始化上车点开始");
    location = await getCurrentLocation();
    state.order.currentLocation = location;
    state.order.pickupLocation = location;
    const pickup = await fetchPickupPointFromLocation(location);
    const nearby = pickup.pois?.length ? pickup.pois.slice(0, 6) : await fetchNearbyPickupPois(location);
    state.origin.status = "ready";
    state.origin.address = pickup.address || state.origin.address;
    state.origin.location = pickup.location;
    state.origin.nearby = nearby;
    state.origin.updatedAt = new Date().toISOString();
    state.order.from = pickup.address || state.order.from;
    state.order.pickupLocation = pickup.location;
    state.order.pickupRaw = pickup.raw;
    logDebug("初始化上车点完成");
    render();
  } catch (error) {
    state.origin.error = error?.message || "定位失败";
    if (location) {
      state.origin.status = "ready";
      state.origin.address = "当前位置";
      state.origin.location = location;
      state.origin.updatedAt = new Date().toISOString();
      state.order.from = "当前位置";
      state.order.currentLocation = location;
      state.order.pickupLocation = location;
      logDebug(`逆地址不可用，降级使用坐标初始化: ${state.origin.error}`);
    } else {
      state.origin.status = "fallback";
      state.order.currentLocation = null;
      logDebug(`初始化上车点失败: ${state.origin.error}`);
    }
    render();
  }
}

function retryPickupInit() {
  initPassengerPickup();
}

async function relocateToCurrentAddress() {
  let location = null;
  try {
    logDebug("手动触发当前位置校准");
    location = await getCurrentLocation();
    state.order.currentLocation = location;
    state.order.pickupLocation = location;
    if (mapRuntime.map && window.TMap) {
      const center = new TMap.LatLng(location.lat, location.lng);
      mapRuntime.map.setCenter(center);
      if (typeof mapRuntime.map.setZoom === "function") {
        mapRuntime.map.setZoom(16);
      }
    }
    const pickup = await fetchPickupPointFromLocation(location);
    state.origin.status = "ready";
    state.origin.address = pickup.address || "当前位置";
    state.origin.location = location;
    state.origin.updatedAt = new Date().toISOString();
    state.origin.nearby = pickup.pois?.slice(0, 6) || state.origin.nearby;
    state.order.from = pickup.address || "当前位置";
    state.order.pickupLocation = location;
    state.order.pickupRaw = pickup.raw;
    logDebug("当前位置校准完成并已录入起点");
  } catch (error) {
    const message = error?.message || "当前位置校准失败";
    if (location) {
      state.origin.status = "ready";
      state.origin.address = "当前位置";
      state.origin.location = location;
      state.origin.updatedAt = new Date().toISOString();
      state.order.from = "当前位置";
      state.order.pickupLocation = location;
      logDebug(`校准已完成，逆地址降级: ${message}`);
    } else {
      state.origin.status = "fallback";
      state.origin.error = message;
      logDebug(`当前位置校准失败: ${message}`);
    }
  }
  render();
}

function showMapMessage(canvas, message) {
  canvas.innerHTML = `<div class="map-empty">${escapeHtml(message)}</div>`;
}

async function mountMainMap(token) {
  const canvas = document.querySelector(".js-main-map");
  if (!canvas) {
    if (mapRuntime.map && typeof mapRuntime.map.destroy === "function") {
      mapRuntime.map.destroy();
    }
    mapRuntime.map = null;
    mapRuntime.mapContainerId = "";
    return;
  }

  try {
    await loadTencentSdk();
  } catch (error) {
    showMapMessage(canvas, error.message || "地图加载失败");
    return;
  }

  if (token !== mapRuntime.renderToken) return;

  const tab = roleTabs[state.role][state.index]?.id || "main";
  if (!canvas.id) {
    canvas.id = `main-map-${state.role}-${tab}`;
  }

  const scene = getMapScene();
  const center = new TMap.LatLng(scene.lat, scene.lng);

  try {
    if (mapRuntime.map && mapRuntime.mapContainerId !== canvas.id) {
      if (typeof mapRuntime.map.destroy === "function") {
        mapRuntime.map.destroy();
      }
      mapRuntime.map = null;
    }

    if (!mapRuntime.map) {
      mapRuntime.map = new TMap.Map(canvas.id, {
        center,
        zoom: scene.zoom,
        pitch: scene.pitch,
        rotation: scene.rotation
      });
      mapRuntime.mapContainerId = canvas.id;
    } else {
      mapRuntime.map.setCenter(center);
      if (typeof mapRuntime.map.setZoom === "function") {
        mapRuntime.map.setZoom(scene.zoom);
      }
    }
  } catch (error) {
    showMapMessage(canvas, error.message || "地图渲染失败");
  }
}

function refreshMainMap() {
  const token = ++mapRuntime.renderToken;
  setTimeout(() => {
    mountMainMap(token);
  }, 0);
}

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

function mapBox() {
  return `
    <div class="map-shell">
      <div class="map-canvas js-main-map"></div>
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
  state.index = 1;
  state.addressPanelOpen = false;
  render();
}

function setTab(i) {
  state.index = i;
  state.addressPanelOpen = false;
  render();
}

function openAddressPanel(mode) {
  state.addressPanelMode = mode;
  state.addressPanelOpen = true;
  render();
}

function openDestinationPanel() {
  openAddressPanel("to");
}

function openOriginPanel() {
  openAddressPanel("from");
}

function closeDestinationPanel() {
  state.addressPanelOpen = false;
  render();
}

function chooseDestination(name) {
  if (state.addressPanelMode === "from") {
    state.order.from = name;
    state.origin.address = name;
  } else {
    state.order.to = name;
  }
  state.addressPanelOpen = false;
  render();
}

function renderAddressIcon(icon) {
  const icons = {
    hotel: "▭",
    store: "◫",
    spot: "△",
    plane: "✈",
    pin: "◎"
  };
  return icons[icon] || "◎";
}

function renderAddressPanel() {
  const isOrigin = state.addressPanelMode === "from";
  const placeholder = isOrigin ? "请输入起点" : "您要去哪儿";
  const dotClass = isOrigin ? "origin-dot" : "dest-dot";
  const quickItems = isOrigin
    ? ["家", "公司", "收藏夹"]
    : ["家", "公司", "收藏夹", "地图选点"];
  const topItems = isOrigin ? addressBook.cities : [{ name: "为你推荐", items: addressBook.recommended, recommended: true }, ...addressBook.cities];

  return `
    <section class="dest-panel" role="dialog" aria-label="地址输入">
      <div class="dest-topbar">
        <button class="dest-back" onclick="closeDestinationPanel()">‹</button>
        <div class="dest-brand">摩滴</div>
        <div class="dest-tools">
          <button class="dest-tool">•••</button>
          <button class="dest-tool">◎</button>
        </div>
      </div>
      <div class="dest-input-wrap didi-panel-input">
        <span class="${dotClass}"></span>
        <input class="dest-input" placeholder="${placeholder}" autofocus />
        ${isOrigin ? "" : '<button class="dest-pass">+ 途经点</button>'}
      </div>
      <div class="dest-quick ${isOrigin ? "origin-quick" : ""}">
        ${quickItems.map((item) => `<button class="quick-item">${item}</button>`).join("")}
      </div>
      <div class="dest-list-stack">
        ${topItems.map((section) => `
          <section class="dest-list-card ${section.recommended ? "recommended-card" : ""}">
            <div class="dest-list-title ${section.recommended ? "recommended-title" : "city-title"}">${section.name}</div>
            ${section.items.map((item) => `
              <button class="dest-item rich-dest-item" onclick="chooseDestination('${escapeHtml(item.title).replaceAll("&#39;", "\\'")}')">
                <div class="dest-item-icon">${renderAddressIcon(item.icon)}</div>
                <div class="dest-item-copy">
                  <div class="dest-main">${item.title}${item.tag ? `<span class="dest-tag">${item.tag}</span>` : ""}</div>
                  <div class="dest-sub">${item.subtitle}</div>
                </div>
                <div class="dest-item-meta">
                  <span class="dest-distance">${item.distance}</span>
                  <span class="dest-fav">收藏</span>
                </div>
              </button>
            `).join("")}
          </section>
        `).join("")}
      </div>
    </section>
  `;
}

function choosePickupPoint(pickup) {
  state.origin.address = pickup.address ? `${pickup.title} · ${pickup.address}` : pickup.title;
  state.order.from = state.origin.address;
  state.origin.location = pickup.location || state.origin.location;
  state.order.pickupLocation = pickup.location || state.order.pickupLocation;
  render();
}

function choosePickupPointByIndex(index) {
  const pickup = state.origin.nearby[index];
  if (!pickup) return;
  choosePickupPoint(pickup);
}

function mockLogin() {
  state.user[state.role].loggedIn = true;
  alert(`${roleName[state.role]}已登录（演示）`);
  render();
}

function mockLogout() {
  alert("当前为调试免登录模式，不退出登录");
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

async function saveAdminMapKey() {
  const input = document.getElementById("adminGaode");
  if (!input) return;
  const key = input.value.trim();

  const resp = await fetch("/api/admin/config/tencent-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!resp.ok) {
    alert("保存失败，请检查后端服务");
    return;
  }

  await loadPublicConfig();
  alert("腾讯配置已保存到后端（前端不暴露明文）");
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
    const destinationPanel = state.addressPanelOpen ? renderAddressPanel() : "";

    return `
      <section class="ride-home">
        <div class="ride-map-stage">
          ${mapBox()}
          <button class="debug-switch" aria-label="切换调试模式" title="切换调试模式" onclick="toggleDebugMode()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.43 7.43 0 0 0 .05-.94 7.43 7.43 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 14.86 1h-3.72a.5.5 0 0 0-.49.42l-.36 2.54c-.57.22-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.61.22L3.74 7.48a.5.5 0 0 0 .12.64l2.03 1.58a7.43 7.43 0 0 0-.05.94c0 .32.02.63.05.94L3.86 13.16a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.4.32.61.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54c.04.24.25.42.49.42h3.72c.24 0 .45-.18.49-.42l.36-2.54c.57-.22 1.12-.53 1.63-.94l2.39.96c.22.09.48 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"/></svg>
            <span class="debug-switch-text">${DEBUG_MODE ? "调试" : "用户"}</span>
          </button>
          <button class="locate-current-btn" aria-label="定位到当前地址" title="定位到当前地址" onclick="relocateToCurrentAddress()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v1.06a7 7 0 0 1 5.94 5.94H20a1 1 0 1 1 0 2h-1.06A7 7 0 0 1 13 18.94V20a1 1 0 1 1-2 0v-1.06A7 7 0 0 1 5.06 13H4a1 1 0 1 1 0-2h1.06A7 7 0 0 1 11 5.06V4a1 1 0 0 1 1-1Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"/></svg>
          </button>
        </div>

        <div class="ride-dock">
          <button class="ride-locator ride-origin-trigger" onclick="openOriginPanel()">
            <div class="dot"></div>
            <div class="from-text">${state.order.from}</div>
          </button>

          <button class="ride-search" onclick="openDestinationPanel()">
            <span class="search-icon">⌕</span>
            <span class="search-text-main">输入目的地</span>
            <span class="search-chip">去：${escapeHtml(state.order.to || "")}</span>
          </button>

          <div class="ride-shortcuts">
            <button class="shortcut"><span class="shortcut-icon">${shortcutIconSvg("reserve")}</span><span>预约</span></button>
            <button class="shortcut"><span class="shortcut-icon">${shortcutIconSvg("helper")}</span><span>帮人叫车</span></button>
          </div>

          ${DEBUG_MODE ? `
            <div class="ride-debug">
              <div class="ride-debug-title">定位日志</div>
              <div class="ride-debug-feed">
                ${state.debugLogs && state.debugLogs.length
                  ? state.debugLogs.map((line) => `<div class="ride-debug-line">${escapeHtml(line)}</div>`).join("")
                  : '<div class="ride-debug-line ride-debug-empty">等待定位与地图进程输出...</div>'}
              </div>
              <button class="ride-debug-toggle" onclick="retryPickupInit()">重新拉取定位</button>
            </div>
          ` : ''}
        </div>

        ${destinationPanel}
      </section>
    `;
  }

  if (tab === "trip") {
    if (state.order.status === "waiting") {
      return `
        <section class="card">
          <h3 class="title">呼叫等待</h3>
          ${mapBox()}
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
          <h3 class="title">司机正在赶来</h3>
          ${mapBox()}
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
        <p class="muted">先在“首页”发起订单</p>
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

  if (tab === "me") {
    return `
      <section class="card">
        <h3 class="title">个人中心</h3>
        <p>昵称：${state.user.passenger.name}</p>
        <p>虚拟钱包：${state.finance.walletPassenger.toFixed(2)} 元</p>
        <p class="muted">当前为调试免登录模式</p>
      </section>
      <section class="card">
        <h3 class="title">调试后台</h3>
        <div class="debug-grid">
          <div class="debug-row"><span>定位状态</span><strong>${state.origin.status}</strong></div>
          <div class="debug-row"><span>定位来源</span><strong>${state.origin.source}</strong></div>
          <div class="debug-row"><span>上车点</span><strong>${state.origin.address || "-"}</strong></div>
          <div class="debug-row"><span>当前位置</span><strong>${state.order.currentLocation ? `${state.order.currentLocation.lat.toFixed(6)}, ${state.order.currentLocation.lng.toFixed(6)}` : "-"}</strong></div>
          <div class="debug-row"><span>POI 数量</span><strong>${state.origin.nearby.length}</strong></div>
          <div class="debug-row"><span>腾讯后端</span><strong>${state.mapConfig.enabled ? `已配置 ${state.mapConfig.keyMask}` : "未配置"}</strong></div>
          <div class="debug-row full"><span>定位错误</span><strong>${state.origin.error || "无"}</strong></div>
        </div>
        <button class="btn alt" onclick="retryPickupInit()">重新拉取定位</button>
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
        ${mapBox()}
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
        ${mapBox()}
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
        <h3 class="title">司机钱包</h3>
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
        <h3 class="title">数据看板</h3>
        <div class="row"><span>实时订单总量</span><strong>${state.finance.totalOrders}</strong></div>
        <div class="row"><span>在线司机数</span><strong>${state.finance.onlineDrivers}</strong></div>
        <div class="row"><span>今日虚拟收入</span><strong>${state.finance.todayIncome.toFixed(2)} 元</strong></div>
        <div class="row"><span>腾讯后端</span><strong>${state.mapConfig.enabled ? `已配置 ${state.mapConfig.keyMask}` : "未配置"}</strong></div>
        <button class="btn alt" onclick="retryPickupInit()">重新拉取定位</button>
      </section>
      <section class="card">
        <h3 class="title">定位调试</h3>
        <div class="debug-grid">
          <div class="debug-row"><span>定位状态</span><strong>${state.origin.status}</strong></div>
          <div class="debug-row"><span>定位来源</span><strong>${state.origin.source}</strong></div>
          <div class="debug-row"><span>上车点</span><strong>${state.origin.address || "-"}</strong></div>
          <div class="debug-row"><span>更新时间</span><strong>${state.origin.updatedAt || "-"}</strong></div>
          <div class="debug-row"><span>当前位置</span><strong>${state.order.currentLocation ? `${state.order.currentLocation.lat.toFixed(6)}, ${state.order.currentLocation.lng.toFixed(6)}` : "-"}</strong></div>
          <div class="debug-row"><span>POI 数量</span><strong>${state.origin.nearby.length}</strong></div>
          <div class="debug-row full"><span>定位错误</span><strong>${state.origin.error || "无"}</strong></div>
          <div class="debug-row full"><span>逆地理原文</span><strong>${state.order.pickupRaw ? escapeHtml(JSON.stringify(state.order.pickupRaw)) : "-"}</strong></div>
        </div>
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
      <label>腾讯 Key（后端保存）<input id="adminGaode" placeholder="输入新 key，前端不回显明文" /></label>
      <button class="btn alt" onclick="saveAdminMapKey()">保存地图配置</button>
      <p class="muted">当前配置状态：${state.mapConfig.enabled ? `已配置 (${state.mapConfig.keyMask})` : "未配置"}</p>
      <button class="btn alt" onclick="mockLogout()">退出后台</button>
    </section>
  `;
}

function renderTabs() {
  const tabs = roleTabs[state.role];
  const el = document.getElementById("mobileTabs");
  el.innerHTML = tabs
    .map((x, i) => {
      const icon = tabIconSvg[x.icon] || tabIconSvg.home;
      return `<button class="tab ${x.id === "home" ? "home-tab" : ""} ${i === state.index ? "active" : ""}" onclick="setTab(${i})"><span class="tab-icon">${icon}</span><span class="tab-text">${x.text}</span></button>`;
    })
    .join("");
}

function renderView() {
  const tab = roleTabs[state.role][state.index].id;
  const view = document.getElementById("view");
  view.classList.toggle("screen-home", state.role === "passenger" && tab === "home");
  if (state.role === "passenger") view.innerHTML = passengerScreen(tab);
  if (state.role === "driver") view.innerHTML = driverScreen(tab);
  if (state.role === "admin") view.innerHTML = adminScreen(tab);
}

function renderMeta() {
  const root = document.querySelector(".phone-shell");
  if (root) {
    root.dataset.role = state.role;
    root.dataset.orderStatus = state.order.status;
  }
}

function render() {
  renderTabs();
  renderView();
  renderMeta();
  refreshMainMap();
}

async function loadPublicConfig() {
  try {
    const [publicResp, bootResp] = await Promise.all([
      fetch("/api/config/public"),
      fetch("/api/tencent/bootstrap")
    ]);

    if (publicResp.ok) {
      const data = await publicResp.json();
      state.mapConfig = data.tencent || state.mapConfig;
    }

    if (bootResp.ok) {
      const boot = await bootResp.json();
      state.mapConfig.enabled = Boolean(boot.keyReady);
      state.mapConfig.keyMask = boot.keyMask || state.mapConfig.keyMask;
    }
  } catch {
    state.mapConfig = { enabled: false, keyMask: "" };
  }
}

loadPublicConfig().then(render);
initPassengerPickup();

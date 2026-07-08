const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const DEFAULT_TENCENT_KEY = "CSIBZ-OXWY3-MD23Q-RVESB-5CESS-YDBTD";
const root = __dirname;
const frontendRoot = path.join(root, "frontend");
const tcMapApiRoot = path.join(root, "TCMapApi");
const configFile = path.join(root, "backend", "config", "runtime.json");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function send(res, code, body, type = "text/plain; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function readRuntimeConfig() {
  try {
    const raw = fs.readFileSync(configFile, "utf-8").replace(/^\uFEFF/, "");
    const data = JSON.parse(raw);
    return {
      amap: {
        jsApiKey: String(data?.amap?.jsApiKey || ""),
        webServiceKey: String(data?.amap?.webServiceKey || ""),
        securityJsCode: String(data?.amap?.securityJsCode || "")
      },
      tencent: {
        jsApiKey: String(data?.tencent?.jsApiKey || DEFAULT_TENCENT_KEY),
        webServiceKey: String(data?.tencent?.webServiceKey || DEFAULT_TENCENT_KEY),
        appKey: String(data?.tencent?.appKey || ""),
        securityJsCode: String(data?.tencent?.securityJsCode || "")
      }
    };
  } catch {
    return {
      amap: { jsApiKey: "", webServiceKey: "", securityJsCode: "" },
      tencent: { jsApiKey: DEFAULT_TENCENT_KEY, webServiceKey: DEFAULT_TENCENT_KEY, appKey: "", securityJsCode: "" }
    };
  }
}

function writeRuntimeConfig(nextConfig) {
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(nextConfig, null, 2), "utf-8");
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function buildAmapJsApiUrl() {
  const cfg = readRuntimeConfig().amap;
  if (!cfg.jsApiKey) {
    return "";
  }
  const params = new URLSearchParams({
    v: "2.0",
    key: cfg.jsApiKey,
    plugin: "AMap.PlaceSearch,AMap.Driving,AMap.AutoComplete,AMap.Geocoder"
  });
  if (cfg.securityJsCode) {
    params.set("securityJsCode", cfg.securityJsCode);
  }
  return `https://webapi.amap.com/maps?${params.toString()}`;
}

function buildTencentJsApiUrl() {
  const cfg = readRuntimeConfig().tencent;
  if (!cfg.jsApiKey) {
    return "";
  }
  const params = new URLSearchParams({
    v: "1.exp",
    key: cfg.jsApiKey
  });
  return `https://map.qq.com/api/gljs?${params.toString()}`;
}

function getTencentServiceKey() {
  const cfg = readRuntimeConfig().tencent;
  return cfg.webServiceKey || cfg.jsApiKey || "";
}

async function requestAmap(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!resp.ok) {
    const message = (data && data.info) || (data && data.message) || `AMap request failed: ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function requestTencent(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!resp.ok) {
    const message = (data && data.message) || (data && data.msg) || `Tencent request failed: ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  if (data && typeof data.status === "number" && data.status !== 0) {
    const err = new Error(data.message || `Tencent API status ${data.status}`);
    err.status = 502;
    err.data = data;
    throw err;
  }
  return data;
}

async function requestOsmReverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    addressdetails: "1"
  });
  const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      "User-Agent": "MotoFlow/1.0 (reverse-geocode-fallback)"
    }
  });
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!resp.ok || !data) {
    throw new Error(`OSM reverse geocode failed: ${resp.status}`);
  }
  return data;
}

function parseLatLngText(locationText) {
  const [latText = "", lngText = ""] = String(locationText || "").split(",");
  const lat = Number(latText.trim());
  const lng = Number(lngText.trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function toTencentLikeResultFromOsm(osmData, latLng) {
  const address = osmData?.display_name || "当前位置";
  const addr = osmData?.address || {};
  const city = addr.city || addr.town || addr.village || addr.state || "";
  const district = addr.city_district || addr.suburb || addr.county || "";
  const road = addr.road || "";
  const houseNumber = addr.house_number || "";
  return {
    status: 0,
    message: "query ok",
    request_id: `fallback-${Date.now()}`,
    result: {
      address,
      formatted_addresses: {
        recommend: address,
        rough: address,
        standard_address: address
      },
      address_component: {
        nation: addr.country || "",
        province: addr.state || "",
        city,
        district,
        street: road,
        street_number: houseNumber
      },
      ad_info: {
        nation_code: "",
        adcode: "",
        city_code: "",
        name: city || district || (addr.state || ""),
        location: {
          lat: latLng.lat,
          lng: latLng.lng
        }
      },
      location: {
        lat: latLng.lat,
        lng: latLng.lng
      },
      poi_count: 0,
      pois: []
    }
  };
}

function toTencentLikeResultFromCoords(latLng) {
  const textAddress = `当前位置(${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)})`;
  return {
    status: 0,
    message: "query ok",
    request_id: `fallback-coords-${Date.now()}`,
    result: {
      address: textAddress,
      formatted_addresses: {
        recommend: textAddress,
        rough: textAddress,
        standard_address: textAddress
      },
      address_component: {
        nation: "",
        province: "",
        city: "",
        district: "",
        street: "",
        street_number: ""
      },
      ad_info: {
        nation_code: "",
        adcode: "",
        city_code: "",
        name: "当前位置",
        location: {
          lat: latLng.lat,
          lng: latLng.lng
        }
      },
      location: {
        lat: latLng.lat,
        lng: latLng.lng
      },
      poi_count: 0,
      pois: []
    }
  };
}

async function handleApi(req, res, cleanUrl) {
  if (req.method === "GET" && cleanUrl === "/api/health") {
    return send(res, 200, JSON.stringify({ ok: true, ts: Date.now() }), "application/json; charset=utf-8");
  }

  if (req.method === "GET" && cleanUrl === "/api/config/public") {
    const cfg = readRuntimeConfig();
    return send(res, 200, JSON.stringify({
      amap: {
        enabled: Boolean(cfg.amap.jsApiKey),
        keyMask: cfg.amap.jsApiKey ? `${cfg.amap.jsApiKey.slice(0, 4)}***${cfg.amap.jsApiKey.slice(-4)}` : ""
      },
      tencent: {
        enabled: Boolean(cfg.tencent.jsApiKey),
        keyMask: cfg.tencent.jsApiKey ? `${cfg.tencent.jsApiKey.slice(0, 4)}***${cfg.tencent.jsApiKey.slice(-4)}` : ""
      }
    }), "application/json; charset=utf-8");
  }

  if (req.method === "GET" && cleanUrl === "/api/tencent/bootstrap") {
    const cfg = readRuntimeConfig();
    return send(res, 200, JSON.stringify({
      keyReady: Boolean(cfg.tencent.jsApiKey),
      keyMask: cfg.tencent.jsApiKey ? `${cfg.tencent.jsApiKey.slice(0, 4)}***${cfg.tencent.jsApiKey.slice(-4)}` : "",
      jsApiUrl: buildTencentJsApiUrl()
    }), "application/json; charset=utf-8");
  }

  if (req.method === "GET" && cleanUrl === "/api/gaode/bootstrap") {
    const cfg = readRuntimeConfig();
    return send(res, 200, JSON.stringify({
      keyReady: Boolean(cfg.amap.jsApiKey),
      keyMask: cfg.amap.jsApiKey ? `${cfg.amap.jsApiKey.slice(0, 4)}***${cfg.amap.jsApiKey.slice(-4)}` : "",
      jsApiUrl: buildAmapJsApiUrl()
    }), "application/json; charset=utf-8");
  }

  if (req.method === "POST" && (cleanUrl === "/api/admin/config/amap-key" || cleanUrl === "/api/admin/config/tencent-key")) {
    try {
      const body = await parseJsonBody(req);
      const cfg = readRuntimeConfig();
      cfg.tencent.jsApiKey = String(body?.jsApiKey || body?.key || "").trim();
      cfg.tencent.webServiceKey = String(body?.webServiceKey || "").trim();
      cfg.tencent.appKey = String(body?.appKey || "").trim();
      cfg.tencent.securityJsCode = String(body?.securityJsCode || "").trim();
      writeRuntimeConfig(cfg);
      return send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 400, JSON.stringify({ ok: false, message: error.message }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/tencent/search/suggestion") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const keyword = url.searchParams.get("keyword") || "";
    const region = url.searchParams.get("region") || "北京";
    const apiKey = getTencentServiceKey();
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "tencent.webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://apis.map.qq.com/ws/place/v1/suggestion/?${new URLSearchParams({ key: apiKey, keyword, region }).toString()}`;
    try {
      const data = await requestTencent(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/tencent/search/poi") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const keyword = url.searchParams.get("keyword") || "";
    const boundary = url.searchParams.get("boundary") || "region(北京,0)";
    const page_size = url.searchParams.get("page_size") || "5";
    const page_index = url.searchParams.get("page_index") || "1";
    const apiKey = getTencentServiceKey();
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "tencent.webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://apis.map.qq.com/ws/place/v1/search/?${new URLSearchParams({ key: apiKey, keyword, boundary, page_size, page_index }).toString()}`;
    try {
      const data = await requestTencent(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/tencent/geo/geocode") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const address = url.searchParams.get("address") || "";
    const region = url.searchParams.get("region") || "北京";
    const apiKey = getTencentServiceKey();
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "tencent.webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://apis.map.qq.com/ws/geocoder/v1/?${new URLSearchParams({ key: apiKey, address, region }).toString()}`;
    try {
      const data = await requestTencent(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/tencent/geo/regeo") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const location = url.searchParams.get("location") || "";
    const get_poi = url.searchParams.get("get_poi") || "1";
    const radius = url.searchParams.get("radius") || "1200";
    const poi_options = url.searchParams.get("poi_options") || "policy=3;orderby=_distance;address_format=short";
    const apiKey = getTencentServiceKey();
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "tencent.webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://apis.map.qq.com/ws/geocoder/v1/?${new URLSearchParams({ key: apiKey, location, get_poi, radius, poi_options }).toString()}`;
    try {
      const data = await requestTencent(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      const latLng = parseLatLngText(location);
      if (!latLng) {
        return send(
          res,
          400,
          JSON.stringify({ ok: false, message: "location 参数格式错误，应为 lat,lng", url: apiUrl }),
          "application/json; charset=utf-8"
        );
      }
      try {
        const osmData = await requestOsmReverseGeocode(latLng.lat, latLng.lng);
        const fallbackData = toTencentLikeResultFromOsm(osmData, latLng);
        return send(
          res,
          200,
          JSON.stringify({ ok: true, data: fallbackData, fallback: "osm", primaryError: error.message, url: apiUrl }),
          "application/json; charset=utf-8"
        );
      } catch (fallbackError) {
        const coordsFallbackData = toTencentLikeResultFromCoords(latLng);
        return send(
          res,
          200,
          JSON.stringify({
            ok: true,
            data: coordsFallbackData,
            fallback: "coords",
            primaryError: error.message,
            fallbackError: fallbackError.message,
            url: apiUrl
          }),
          "application/json; charset=utf-8"
        );
      }
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/tencent/route/driving") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";
    const policy = url.searchParams.get("policy") || "0";
    const apiKey = getTencentServiceKey();
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "tencent.webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://apis.map.qq.com/ws/direction/v1/driving/?${new URLSearchParams({ key: apiKey, from, to, policy }).toString()}`;
    try {
      const data = await requestTencent(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/gaode/search/tips") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const keywords = url.searchParams.get("keywords") || "";
    const city = url.searchParams.get("city") || "010";
    const apiKey = readRuntimeConfig().amap.webServiceKey;
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://restapi.amap.com/v3/assistant/inputtips?${new URLSearchParams({ key: apiKey, keywords, city, datatype: "all", citylimit: "true" }).toString()}`;
    try {
      const data = await requestAmap(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/gaode/search/poi") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const keywords = url.searchParams.get("keywords") || "";
    const city = url.searchParams.get("city") || "010";
    const page = url.searchParams.get("page") || "1";
    const offset = url.searchParams.get("offset") || "5";
    const apiKey = readRuntimeConfig().amap.webServiceKey;
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://restapi.amap.com/v3/place/text?${new URLSearchParams({ key: apiKey, keywords, city, citylimit: "true", page, offset, extensions: "all" }).toString()}`;
    try {
      const data = await requestAmap(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/gaode/geo/geocode") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const address = url.searchParams.get("address") || "";
    const city = url.searchParams.get("city") || "010";
    const apiKey = readRuntimeConfig().amap.webServiceKey;
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://restapi.amap.com/v3/geocode/geo?${new URLSearchParams({ key: apiKey, address, city }).toString()}`;
    try {
      const data = await requestAmap(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/gaode/geo/regeo") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const location = url.searchParams.get("location") || "";
    const radius = url.searchParams.get("radius") || "1000";
    const extensions = url.searchParams.get("extensions") || "all";
    const apiKey = readRuntimeConfig().amap.webServiceKey;
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://restapi.amap.com/v3/geocode/regeo?${new URLSearchParams({ key: apiKey, location, radius, extensions }).toString()}`;
    try {
      const data = await requestAmap(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  if (req.method === "GET" && cleanUrl === "/api/gaode/route/driving") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const origin = url.searchParams.get("origin") || "";
    const destination = url.searchParams.get("destination") || "";
    const strategy = url.searchParams.get("strategy") || "0";
    const extensions = url.searchParams.get("extensions") || "base";
    const apiKey = readRuntimeConfig().amap.webServiceKey;
    if (!apiKey) {
      return send(res, 400, JSON.stringify({ ok: false, message: "webServiceKey 未配置" }), "application/json; charset=utf-8");
    }
    const apiUrl = `https://restapi.amap.com/v3/direction/driving?${new URLSearchParams({ key: apiKey, origin, destination, strategy, extensions }).toString()}`;
    try {
      const data = await requestAmap(apiUrl);
      return send(res, 200, JSON.stringify({ ok: true, data }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 502, JSON.stringify({ ok: false, message: error.message, url: apiUrl }), "application/json; charset=utf-8");
    }
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const cleanUrl = (req.url || "/").split("?")[0];

  if (cleanUrl.startsWith("/api/")) {
    const handled = await handleApi(req, res, cleanUrl);
    if (handled !== false) return;
    return send(res, 404, JSON.stringify({ ok: false, message: "API Not Found" }), "application/json; charset=utf-8");
  }

  if (cleanUrl.startsWith("/TCMapApi/")) {
    const target = cleanUrl === "/TCMapApi/"
      ? "/index.html"
      : cleanUrl.replace(/^\/TCMapApi/, "");
    const filePath = path.join(tcMapApiRoot, target);
    if (!filePath.startsWith(tcMapApiRoot)) return send(res, 403, "Forbidden");
    fs.readFile(filePath, (err, data) => {
      if (err) return send(res, 404, "Not Found");
      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, mime[ext] || "application/octet-stream");
    });
    return;
  }

  const target = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = path.join(frontendRoot, target);
  if (!filePath.startsWith(frontendRoot)) return send(res, 403, "Forbidden");

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, "Not Found");
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, mime[ext] || "application/octet-stream");
  });
});

server.on("error", (error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`MotoFlow server running at http://${HOST}:${PORT}`);
  console.log(`Serving frontend from: ${frontendRoot}`);
  console.log(`Serving TCMapApi center from: ${tcMapApiRoot}`);
  console.log(`Runtime config: ${configFile}`);
});

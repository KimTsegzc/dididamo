const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";

const root = __dirname;
const frontendRoot = path.join(root, "frontend");
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
  res.writeHead(code, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readRuntimeConfig() {
  try {
    const raw = fs.readFileSync(configFile, "utf-8");
    const data = JSON.parse(raw);
    return {
      amap: {
        webKey: String(data?.amap?.webKey || "")
      }
    };
  } catch {
    return { amap: { webKey: "" } };
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

async function handleApi(req, res, cleanUrl) {
  if (req.method === "GET" && cleanUrl === "/api/health") {
    return send(res, 200, JSON.stringify({ ok: true, ts: Date.now() }), "application/json; charset=utf-8");
  }

  if (req.method === "GET" && cleanUrl === "/api/config/public") {
    const cfg = readRuntimeConfig();
    return send(
      res,
      200,
      JSON.stringify({
        amap: {
          enabled: Boolean(cfg.amap.webKey),
          keyMask: cfg.amap.webKey ? `${cfg.amap.webKey.slice(0, 4)}***${cfg.amap.webKey.slice(-4)}` : ""
        }
      }),
      "application/json; charset=utf-8"
    );
  }

  if (req.method === "POST" && cleanUrl === "/api/admin/config/amap-key") {
    try {
      const body = await parseJsonBody(req);
      const nextKey = String(body?.key || "").trim();
      const cfg = readRuntimeConfig();
      cfg.amap.webKey = nextKey;
      writeRuntimeConfig(cfg);
      return send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    } catch (error) {
      return send(res, 400, JSON.stringify({ ok: false, message: error.message }), "application/json; charset=utf-8");
    }
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const cleanUrl = (req.url || "/").split("?")[0];

  if (cleanUrl.startsWith("/api/")) {
    const handled = await handleApi(req, res, cleanUrl);
    if (handled !== false) {
      return;
    }
    return send(res, 404, JSON.stringify({ ok: false, message: "API Not Found" }), "application/json; charset=utf-8");
  }

  const target = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = path.join(frontendRoot, target);

  if (!filePath.startsWith(frontendRoot)) {
    return send(res, 403, "Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return send(res, 404, "Not Found");
    }
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
  console.log(`Runtime config: ${configFile}`);
});

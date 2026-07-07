const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const root = __dirname;

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
  res.writeHead(code, { "Content-Type": type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || "/").split("?")[0];
  const target = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = path.join(root, target);

  if (!filePath.startsWith(root)) {
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
  console.log(`MotoFlow MVP running at http://${HOST}:${PORT}`);
});

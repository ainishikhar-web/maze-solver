const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon"
};
const server = http.createServer((req, res) => {
  let url = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(PUBLIC, url);
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404 - Not Found</h1>");
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
});
server.listen(PORT, "0.0.0.0", () => {
  console.log("Maze Solver running at http://0.0.0.0:" + PORT);
});

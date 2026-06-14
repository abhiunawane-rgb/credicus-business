/**
 * Minimal cPanel test — startup file: test-server.js
 * If this works, credicus.in shows: Credicus test OK
 */
const http = require("http");

const port = parseInt(process.env.PORT || "3000", 10);
const host = "127.0.0.1";

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Credicus test OK");
});

server.listen(port, host, () => {
  console.log(`[credicus-test] http://${host}:${port}`);
});

module.exports = server;

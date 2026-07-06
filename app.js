/**
 * cPanel startup — standalone server when present, else custom Next.js server.
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const dir = __dirname;
const home = process.env.HOME || "";
const port = parseInt(process.env.PORT || "3000", 10);
const host = "127.0.0.1";

function log(msg) {
  console.log(`[credicus] ${msg}`);
}
function die(msg) {
  console.error(`[credicus] ERROR: ${msg}`);
  process.exit(1);
}

function wireNodeModules() {
  const candidates = [
    path.join(dir, "node_modules"),
    path.join(home, "nodevenv/public_html/credicus.in/24/lib/node_modules"),
    path.join(home, "nodeenv/public_html/credicus.in/24/lib/node_modules"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "next"))) {
      if (candidate !== path.join(dir, "node_modules")) {
        process.env.NODE_PATH = [candidate, process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
        Module._initPaths();
      }
      log(`node_modules: ${candidate}`);
      return;
    }
  }
  die("Cannot find 'next'. Run NPM Install, then Restart.");
}

const standaloneServer = path.join(dir, ".next", "standalone", "server.js");
const useStandalone = process.env.CREDICUS_STANDALONE === "true" && fs.existsSync(standaloneServer);
if (useStandalone) {
  log("starting standalone server");
  process.chdir(path.join(dir, ".next", "standalone"));
  process.env.HOSTNAME = host;
  if (!process.env.PORT) process.env.PORT = String(port);
  require("./server.js");
  return;
}

wireNodeModules();

if (!fs.existsSync(path.join(dir, ".next", "BUILD_ID"))) {
  die("Missing .next/BUILD_ID");
}
if (fs.existsSync(path.join(dir, "next.config.ts"))) {
  die("Delete next.config.ts");
}
if (!fs.existsSync(path.join(dir, "next.config.js"))) {
  die("Create next.config.js");
}

log(`build: ${fs.readFileSync(path.join(dir, ".next", "BUILD_ID"), "utf8").trim()}`);

const http = require("http");
const { parse } = require("url");
const next = require("next");
const app = next({ dev: false, dir });
const handle = app.getRequestHandler();

module.exports = app
  .prepare()
  .then(() => {
    log("Next.js ready");
    const server = http.createServer((req, res) => {
      handle(req, res, parse(req.url, true)).catch((err) => {
        console.error("[credicus]", err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
    });
    server.listen(port, host, () => log(`listening on ${host}:${port}`));
    return server;
  })
  .catch((err) => {
    console.error("[credicus] startup failed:", err);
    process.exit(1);
  });

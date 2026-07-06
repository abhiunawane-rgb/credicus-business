/**
 * cPanel startup — uses standalone server when available (most reliable on shared hosting).
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");

const dir = __dirname;
const home = process.env.HOME || "";
const port = parseInt(process.env.PORT || "3000", 10);

function log(msg) {
  console.log(`[credicus] ${msg}`);
}
function die(msg) {
  console.error(`[credicus] ERROR: ${msg}`);
  process.exit(1);
}

function wireNodeModules() {
  const local = path.join(dir, "node_modules");
  const candidates = [
    local,
    path.join(home, "nodevenv/public_html/credicus.in/24/lib/node_modules"),
    path.join(home, "nodeenv/public_html/credicus.in/24/lib/node_modules"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "next"))) {
      if (candidate !== local) {
        process.env.NODE_PATH = [candidate, process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
        Module._initPaths();
      }
      log(`node_modules: ${candidate}`);
      return;
    }
  }
  die("Cannot find 'next'. Click Run NPM Install, then Restart.");
}

const standaloneDir = path.join(dir, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

if (fs.existsSync(standaloneServer)) {
  log("starting standalone server");
  process.chdir(standaloneDir);
  process.env.HOSTNAME = "0.0.0.0";
  if (!process.env.PORT) process.env.PORT = String(port);
  require("./server.js");
  return;
}

wireNodeModules();

if (!fs.existsSync(path.join(dir, ".next", "BUILD_ID"))) {
  die("Missing .next/BUILD_ID — upload credicus-cpanel.zip again");
}
if (fs.existsSync(path.join(dir, "next.config.ts"))) {
  die("Delete next.config.ts (keep next.config.js only)");
}
if (!fs.existsSync(path.join(dir, "next.config.js"))) {
  die("Create next.config.js in File Manager");
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

    if (typeof PhusionPassenger !== "undefined") {
      PhusionPassenger.configure({ autoInstall: false });
      server.listen("passenger", () => log("listening on passenger"));
    } else {
      server.listen(port, () => log(`listening on port ${port}`));
    }

    return server;
  })
  .catch((err) => {
    console.error("[credicus] startup failed:", err);
    process.exit(1);
  });

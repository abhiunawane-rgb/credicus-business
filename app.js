/**
 * cPanel Node.js startup file.
 * Requires a production build (.next/BUILD_ID) — use create-cpanel-package.ps1
 * which builds locally and includes .next in the upload ZIP.
 */
const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const path = require("path");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const dir = __dirname;
const buildIdPath = path.join(dir, ".next", "BUILD_ID");

if (!fs.existsSync(buildIdPath)) {
  console.error("");
  console.error("ERROR: Production build missing (.next/BUILD_ID not found).");
  console.error("Run on your PC:  npm run build");
  console.error("Then upload the .next folder, OR use scripts/create-cpanel-package.ps1");
  console.error("");
}

const app = next({ dev: false, dir });
const handle = app.getRequestHandler();

const ready = app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error("Request error:", req.url, error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.listen(port, hostname, () => {
    console.log(`Credicus running on port ${port} (production)`);
  });

  return server;
});

ready.catch((error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});

module.exports = ready;

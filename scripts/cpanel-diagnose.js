/**
 * Run from cPanel → Setup Node.js App → "Run JS script"
 * File: scripts/cpanel-diagnose.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function check(label, ok, detail) {
  const mark = ok ? "OK" : "FAIL";
  console.log(`[${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

console.log("");
console.log("=== Credicus cPanel diagnostics ===");
console.log("Root:", root);
console.log("Node:", process.version);
console.log("NODE_ENV:", process.env.NODE_ENV || "(not set)");
console.log("PORT:", process.env.PORT || "(not set)");
console.log("");

let allOk = true;

allOk =
  check("package.json", fs.existsSync(path.join(root, "package.json"))) && allOk;
allOk =
  check("app.js", fs.existsSync(path.join(root, "app.js"))) && allOk;
allOk =
  check(
    ".next/BUILD_ID (production build)",
    fs.existsSync(path.join(root, ".next", "BUILD_ID")),
    fs.existsSync(path.join(root, ".next", "BUILD_ID"))
      ? fs.readFileSync(path.join(root, ".next", "BUILD_ID"), "utf8").trim()
      : "Re-upload credicus-cpanel.zip and extract fully",
  ) && allOk;
allOk =
  check("prisma/schema.prisma", fs.existsSync(path.join(root, "prisma", "schema.prisma"))) &&
  allOk;
allOk =
  check(
    "Prisma client",
    fs.existsSync(path.join(root, "node_modules", ".prisma", "client", "index.js")),
    "Run in Terminal: cd ~/public_html/credicus.in && npx prisma generate",
  ) && allOk;
allOk =
  check(
    "next.config.js (not .ts)",
    fs.existsSync(path.join(root, "next.config.js")) &&
      !fs.existsSync(path.join(root, "next.config.ts")),
    fs.existsSync(path.join(root, "next.config.ts"))
      ? "DELETE next.config.ts on server — it causes crash"
      : undefined,
  ) && allOk;
allOk =
  check("node_modules/next", fs.existsSync(path.join(root, "node_modules", "next"))) && allOk;

const jwt = process.env.JWT_SECRET;
allOk = check("JWT_SECRET env", Boolean(jwt && jwt.length >= 16), jwt ? "set" : "missing") && allOk;
allOk =
  check(
    "NODE_ENV env",
    process.env.NODE_ENV === "production",
    process.env.NODE_ENV || "should be production",
  ) && allOk;

console.log("");
console.log("Trying Next.js prepare() (this may take 30–60 seconds)...");

try {
  const next = require("next");
  const app = next({ dev: false, dir: root });
  app
    .prepare()
    .then(() => {
      console.log("[OK] Next.js prepare() succeeded — app should start.");
      console.log("");
      process.exit(allOk ? 0 : 1);
    })
    .catch((error) => {
      console.error("[FAIL] Next.js prepare() failed:");
      console.error(error);
      console.log("");
      console.log("Check the Passenger log in cPanel for the same error after Restart.");
      process.exit(1);
    });
} catch (error) {
  console.error("[FAIL] Could not load next:", error);
  process.exit(1);
}

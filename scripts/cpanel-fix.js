/**
 * ONE script for cPanel — no Terminal needed.
 * Setup Node.js App → Run JS script → type exactly:
 *   scripts/cpanel-fix.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

function ok(label, pass, note) {
  console.log(`${pass ? "[OK]" : "[!!]"} ${label}${note ? ` — ${note}` : ""}`);
  return pass;
}

console.log("");
console.log("=== Credicus fix (no Terminal) ===");
console.log("Folder:", root);
console.log("");

let ready = true;

ready = ok("app.js", fs.existsSync(path.join(root, "app.js"))) && ready;
ready =
  ok(
    ".next/BUILD_ID",
    fs.existsSync(path.join(root, ".next", "BUILD_ID")),
    fs.existsSync(path.join(root, ".next", "BUILD_ID")) ? undefined : "Re-upload credicus-cpanel.zip",
  ) && ready;
ready =
  ok(
    "next.config.js",
    fs.existsSync(path.join(root, "next.config.js")),
    !fs.existsSync(path.join(root, "next.config.js")) ? "missing" : undefined,
  ) && ready;

if (fs.existsSync(path.join(root, "next.config.ts"))) {
  ok("next.config.ts", false, "DELETE this file in File Manager");
  ready = false;
} else {
  ok("next.config.ts removed", true);
}

const standalone = path.join(root, ".next", "standalone");
const standaloneOff = path.join(root, ".next", "standalone_off");
if (fs.existsSync(standalone) && !fs.existsSync(standaloneOff)) {
  ok(".next/standalone", false, 'Rename folder "standalone" to "standalone_off" in File Manager');
} else {
  ok(".next/standalone_off (or absent)", true);
}

ok("JWT_SECRET", Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16), process.env.JWT_SECRET ? "set" : "ADD in env vars");
ok("NODE_ENV", process.env.NODE_ENV === "production", process.env.NODE_ENV || 'ADD NODE_ENV=production');
ok("COOKIE_SECURE or ALLOW_INSECURE_COOKIES", Boolean(process.env.COOKIE_SECURE || process.env.ALLOW_INSECURE_COOKIES), "set one of these");

console.log("");
console.log("Running prisma generate...");

if (!fs.existsSync(path.join(root, "node_modules", "prisma"))) {
  console.log("[!!] Prisma missing — click Run NPM Install first, then run this script again.");
  process.exit(1);
}

try {
  execSync("npx prisma generate", { stdio: "inherit", env: process.env, cwd: root });
  ok("Prisma client", fs.existsSync(path.join(root, "node_modules", ".prisma", "client", "index.js")));
} catch (error) {
  console.error("[!!] prisma generate failed:", error.message || error);
  process.exit(1);
}

console.log("");
if (!ready) {
  console.log("Fix the [!!] items above in File Manager / Environment variables.");
  console.log("Then click RESTART on the Node.js app.");
  process.exit(1);
}

console.log("All checks passed.");
console.log("Now: Setup Node.js App → click RESTART → open https://credicus.in");
console.log("Login: admin@credicus.com / Admin@123");
console.log("");

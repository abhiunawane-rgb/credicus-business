/**
 * No Terminal needed — run from cPanel:
 * Setup Node.js App → Run JS script → scripts/cpanel-setup.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

console.log("");
console.log("=== Credicus setup (no Terminal) ===");
console.log("Folder:", root);
console.log("");

function fail(message) {
  console.error("FAIL:", message);
  process.exit(1);
}

if (!fs.existsSync(path.join(root, "prisma", "schema.prisma"))) {
  fail("prisma/schema.prisma not found. Check Application root folder.");
}

if (!fs.existsSync(path.join(root, "node_modules", "prisma"))) {
  fail("Prisma not installed. Click Run NPM Install first, then run this script again.");
}

console.log("Step 1/2: prisma generate (may take 1–2 minutes)...");
try {
  execSync("npx prisma generate", {
    stdio: "inherit",
    env: process.env,
    cwd: root,
  });
  console.log("[OK] Prisma client generated.");
} catch (error) {
  fail(`prisma generate failed — ${error.message || error}`);
}

const clientPath = path.join(root, "node_modules", ".prisma", "client", "index.js");
if (!fs.existsSync(clientPath)) {
  fail("Prisma client still missing after generate.");
}

console.log("");
console.log("Step 2/2: quick checks");
console.log("[OK] .next/BUILD_ID:", fs.existsSync(path.join(root, ".next", "BUILD_ID")));
console.log("[OK] app.js:", fs.existsSync(path.join(root, "app.js")));
console.log("[OK] NODE_ENV:", process.env.NODE_ENV || "(not set — add NODE_ENV=production)");
console.log("[OK] JWT_SECRET:", process.env.JWT_SECRET ? "set" : "MISSING");
console.log("");
console.log("Done. Now click RESTART on the Node.js app, then open your website.");
console.log("");

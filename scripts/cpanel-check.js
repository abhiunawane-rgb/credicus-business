/**
 * Safe checks only — no npm install needed. Run via Setup Node.js App -> Run JS script.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..");
const home = process.env.HOME || "";

console.log("");
console.log("=== Credicus quick check ===");
console.log("Folder:", dir);
console.log("");

function line(label, ok, note) {
  console.log(`${ok ? "OK" : "FAIL"} - ${label}${note ? ` (${note})` : ""}`);
}

line("app.js", fs.existsSync(path.join(dir, "app.js")));
line("package.json", fs.existsSync(path.join(dir, "package.json")));
line(".next/BUILD_ID", fs.existsSync(path.join(dir, ".next", "BUILD_ID")));
line("next.config.js", fs.existsSync(path.join(dir, "next.config.js")));
line(
  "next.config.ts deleted",
  !fs.existsSync(path.join(dir, "next.config.ts")),
  fs.existsSync(path.join(dir, "next.config.ts")) ? "DELETE this file" : "good",
);

const localNm = path.join(dir, "node_modules", "next");
const venvNm = path.join(home, "nodevenv/public_html/credicus.in/24/lib/node_modules", "next");
line("node_modules/next (local)", fs.existsSync(localNm));
line("node_modules/next (nodevenv)", fs.existsSync(venvNm));

const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
line("postinstall removed", !pkg.scripts.postinstall, pkg.scripts.postinstall || "good");

console.log("");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "set" : "MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV || "MISSING");
console.log("PORT:", process.env.PORT || "MISSING");
console.log("");

if (!fs.existsSync(path.join(dir, "next.config.js"))) {
  console.log("FIX: Create next.config.js in File Manager (ask support for contents).");
}
if (fs.existsSync(path.join(dir, "next.config.ts"))) {
  console.log("FIX: Delete next.config.ts in File Manager.");
}
if (!fs.existsSync(localNm) && !fs.existsSync(venvNm)) {
  console.log("FIX: Click Run NPM Install, then Restart.");
}

console.log("");

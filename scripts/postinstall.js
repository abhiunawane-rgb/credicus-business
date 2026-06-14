/**
 * Safe postinstall for cPanel / VPS deploy.
 * Runs prisma generate only when prisma/schema.prisma exists.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("");
  console.error("╔══════════════════════════════════════════════════════════════╗");
  console.error("║  DEPLOY ERROR: prisma/schema.prisma not found on server      ║");
  console.error("╠══════════════════════════════════════════════════════════════╣");
  console.error("║  Upload the entire prisma/ folder next to package.json.      ║");
  console.error("║  Required files:                                             ║");
  console.error("║    prisma/schema.prisma                                      ║");
  console.error("║    prisma/seed.ts (optional)                                 ║");
  console.error("║                                                              ║");
  console.error("║  In cPanel File Manager, your app root should contain:       ║");
  console.error("║    app/  components/  lib/  prisma/  public/  package.json    ║");
  console.error("╚══════════════════════════════════════════════════════════════╝");
  console.error("");
  process.exit(1);
}

console.log("Running prisma generate...");
try {
  execSync("npx prisma generate --schema=./prisma/schema.prisma", {
    stdio: "inherit",
    cwd: root,
  });
  console.log("Prisma client generated.");
} catch (error) {
  console.warn("Prisma generate skipped or failed — demo mode still works without DATABASE_URL.");
  console.warn(String(error.message || error));
}

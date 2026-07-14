/**
 * Demo / memory mode when Postgres is missing or clearly not configured.
 * Module-level flag can also be flipped at runtime via disableDatabase().
 */

function hasUsableDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url) return false;
  // Common placeholder values from example env files
  if (/USER:PASSWORD/i.test(url)) return false;
  if (/changeme|your[_-]?password|example\.com/i.test(url)) return false;
  // This app only supports PostgreSQL (Prisma schema provider = postgresql)
  if (!/^postgres(ql)?:\/\//i.test(url)) return false;
  return true;
}

let memoryOnly =
  process.env.CREDICUS_DEMO_MODE === "true" || !hasUsableDatabaseUrl();

export function useDatabase(): boolean {
  return !memoryOnly;
}

export function disableDatabase(): void {
  memoryOnly = true;
}

export function isDatabaseConfigured(): boolean {
  return hasUsableDatabaseUrl();
}

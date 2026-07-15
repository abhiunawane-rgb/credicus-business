/**
 * Prefer PostgreSQL whenever DATABASE_URL is usable.
 * CREDICUS_DEMO_MODE only forces memory when no usable database is configured.
 * (Previously DEMO_MODE ignored DATABASE_URL and caused create→404 / lost users on Vercel.)
 */

function hasUsableDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url) return false;
  if (/USER:PASSWORD/i.test(url)) return false;
  if (/changeme|your[_-]?password|example\.com/i.test(url)) return false;
  if (!/^postgres(ql)?:\/\//i.test(url)) return false;
  return true;
}

let memoryOnly = !hasUsableDatabaseUrl();

export function useDatabase(): boolean {
  return !memoryOnly;
}

export function disableDatabase(): void {
  memoryOnly = true;
}

export function isDatabaseConfigured(): boolean {
  return hasUsableDatabaseUrl();
}

/** Explicitly force demo/memory mode (tests / recovery). */
export function enableMemoryOnlyMode(): void {
  memoryOnly = true;
}

/**
 * Prefer PostgreSQL whenever DATABASE_URL is usable.
 * Never permanently flip to memory after a transient DB error — that caused users
 * to "save" in memory and vanish after refresh on Vercel.
 */

function hasUsableDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url) return false;
  if (/USER:PASSWORD/i.test(url)) return false;
  if (/changeme|your[_-]?password|example\.com/i.test(url)) return false;
  if (!/^postgres(ql)?:\/\//i.test(url)) return false;
  return true;
}

/** Test-only override. Production always follows DATABASE_URL. */
let forceMemoryOnly = false;

export function useDatabase(): boolean {
  if (forceMemoryOnly) return false;
  return hasUsableDatabaseUrl();
}

/**
 * Kept for call-site compatibility. Does NOT disable Postgres for the process —
 * sticky disable previously made create→memory and list→empty across refreshes.
 */
export function disableDatabase(): void {
  // no-op by design when DATABASE_URL is configured
}

export function isDatabaseConfigured(): boolean {
  return hasUsableDatabaseUrl();
}

/** Explicitly force demo/memory mode (tests only). */
export function enableMemoryOnlyMode(): void {
  forceMemoryOnly = true;
}

export function clearMemoryOnlyMode(): void {
  forceMemoryOnly = false;
}

export class DatabaseRequiredError extends Error {
  readonly code = "DATABASE_REQUIRED";

  constructor(
    message = "PostgreSQL DATABASE_URL is required. Users and other data cannot be stored in memory on the live server.",
  ) {
    super(message);
    this.name = "DatabaseRequiredError";
  }
}

export class DatabaseUnavailableError extends Error {
  readonly code = "DATABASE_UNAVAILABLE";

  constructor(message = "Cannot reach the database. Check DATABASE_URL and that tables exist (npm run prisma:setup).") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

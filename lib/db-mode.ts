/** When true, all candidate CRUD uses in-memory store (cPanel demo / no PostgreSQL). */
let memoryOnly = process.env.CREDICUS_DEMO_MODE === "true" || !process.env.DATABASE_URL;

export function useDatabase(): boolean {
  return !memoryOnly;
}

export function disableDatabase(): void {
  memoryOnly = true;
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearch(query: string, fields: Array<string | null | undefined>): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

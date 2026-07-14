export type SortDirection = "asc" | "desc";

export type SortState<Key extends string = string> = {
  key: Key;
  direction: SortDirection;
};

export function toggleSortDirection(current: SortDirection): SortDirection {
  return current === "asc" ? "desc" : "asc";
}

export function compareSortValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  const left = String(a).toLowerCase();
  const right = String(b).toLowerCase();
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

export function sortRows<T>(
  rows: T[],
  getValue: (row: T) => unknown,
  direction: SortDirection,
): T[] {
  const sorted = [...rows].sort((left, right) => compareSortValues(getValue(left), getValue(right)));
  return direction === "asc" ? sorted : sorted.reverse();
}

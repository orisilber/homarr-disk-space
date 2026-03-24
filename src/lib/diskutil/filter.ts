import type { DiskUsageRow } from "./types";

export function parseDiskFilterParam(param: string | null): string[] | null {
  if (param == null) return null;
  const trimmed = param.trim();
  if (!trimmed) return null;
  const ids = trimmed
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return ids.length ? ids : null;
}

/** When `filter` is set, order bars to match the comma-separated order in the URL (first id on top). */
export function filterDisksByIds(
  rows: DiskUsageRow[],
  filter: string[] | null,
): DiskUsageRow[] {
  if (!filter?.length) return rows;
  const byId = new Map(rows.map((r) => [r.id.toLowerCase(), r] as const));
  const out: DiskUsageRow[] = [];
  const seen = new Set<string>();
  for (const id of filter) {
    if (seen.has(id)) continue;
    const row = byId.get(id);
    if (row) {
      out.push(row);
      seen.add(id);
    }
  }
  return out;
}

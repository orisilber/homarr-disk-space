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

export function filterDisksByIds(
  rows: DiskUsageRow[],
  filter: string[] | null,
): DiskUsageRow[] {
  if (!filter?.length) return rows;
  const want = new Set(filter);
  return rows.filter((r) => want.has(r.id.toLowerCase()));
}

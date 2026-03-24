import { parse } from "fast-plist";

export type DiskListPhysicalParsed = {
  wholeDisks: string[];
  allDisksAndPartitions: unknown;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export function parseDiskListPhysicalPlist(xml: string): DiskListPhysicalParsed {
  const root = parse(xml) as Record<string, unknown>;
  return {
    wholeDisks: asStringArray(root.WholeDisks),
    allDisksAndPartitions: root.AllDisksAndPartitions,
  };
}

export function buildPartitionToWholeDisk(
  parsed: DiskListPhysicalParsed,
): Map<string, string> {
  const map = new Map<string, string>();
  const top = parsed.allDisksAndPartitions;
  if (!Array.isArray(top)) return map;

  for (const entry of top) {
    if (!entry || typeof entry !== "object") continue;
    const disk = entry as Record<string, unknown>;
    const id = disk.DeviceIdentifier;
    if (typeof id !== "string") continue;
    map.set(id, id);
    const parts = disk.Partitions;
    if (!Array.isArray(parts)) continue;
    for (const p of parts) {
      if (!p || typeof p !== "object") continue;
      const pid = (p as Record<string, unknown>).DeviceIdentifier;
      if (typeof pid === "string") map.set(pid, id);
    }
  }
  return map;
}

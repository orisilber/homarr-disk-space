import { parse } from "fast-plist";

export type ApfsContainerRow = {
  designatedPhysicalStore: string;
  capacityCeiling: number;
  capacityFree: number;
};

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function parseApfsListPlist(xml: string): ApfsContainerRow[] {
  const root = parse(xml) as Record<string, unknown>;
  const containers = root.Containers;
  if (!Array.isArray(containers)) return [];

  const rows: ApfsContainerRow[] = [];
  for (const c of containers) {
    if (!c || typeof c !== "object") continue;
    const d = c as Record<string, unknown>;
    const store = d.DesignatedPhysicalStore;
    if (typeof store !== "string" || !store) continue;
    rows.push({
      designatedPhysicalStore: store,
      capacityCeiling: num(d.CapacityCeiling),
      capacityFree: num(d.CapacityFree),
    });
  }
  return rows;
}

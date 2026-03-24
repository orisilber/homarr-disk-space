import type { ApfsContainerRow } from "./apfs";
import type { DiskListPhysicalParsed } from "./list";
import { parseDiskInfoPlist } from "./info";
import type { DiskUsageRow } from "./types";

export type BuildDiskUsageInput = {
  wholeDisks: DiskListPhysicalParsed["wholeDisks"];
  partitionToWholeDisk: Map<string, string>;
  apfsContainers: ApfsContainerRow[];
  diskInfoPlists: Record<string, string>;
};

export function buildDiskUsageRows(input: BuildDiskUsageInput): DiskUsageRow[] {
  const usedFromApfsByWhole = new Map<string, number>();
  for (const c of input.apfsContainers) {
    const whole = input.partitionToWholeDisk.get(c.designatedPhysicalStore);
    if (!whole) continue;
    const used = Math.max(0, c.capacityCeiling - c.capacityFree);
    usedFromApfsByWhole.set(whole, (usedFromApfsByWhole.get(whole) ?? 0) + used);
  }

  return input.wholeDisks.map((id) => {
    const plist = input.diskInfoPlists[id];
    const info = plist ? parseDiskInfoPlist(plist) : null;
    const totalBytes = info?.totalBytes ?? 0;
    const apfsUsed = usedFromApfsByWhole.get(id) ?? 0;

    let usedBytes = apfsUsed;
    if (apfsUsed <= 0 && info?.freeBytes != null && totalBytes > 0) {
      usedBytes = Math.max(0, totalBytes - info.freeBytes);
    }

    if (totalBytes > 0 && usedBytes > totalBytes) {
      usedBytes = totalBytes;
    }

    const media = info?.mediaName?.trim();
    const label = media ? `${id} — ${media}` : id;

    return {
      id,
      label,
      totalBytes,
      usedBytes,
    };
  });
}

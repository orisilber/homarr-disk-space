import type { ApfsContainerRow } from "./apfs";
import type { DiskInfoParsed } from "./info";
import type { DiskListPhysicalParsed } from "./list";
import { getPartitionIdsForWholeDisk } from "./list";
import { parseDiskInfoPlist } from "./info";
import type { DiskUsageRow } from "./types";

export type BuildDiskUsageInput = {
  diskList: DiskListPhysicalParsed;
  partitionToWholeDisk: Map<string, string>;
  apfsContainers: ApfsContainerRow[];
  diskInfoPlists: Record<string, string>;
  /** `diskutil info -plist` output per partition slice (e.g. disk4s1). */
  partitionInfoPlists: Record<string, string>;
};

function displayNameFromInfo(info: DiskInfoParsed | null, id: string): string {
  const io = info?.ioRegistryEntryName?.trim();
  if (io) return io;
  const media = info?.mediaName?.trim();
  if (media) return media;
  return id;
}

/** Sum (size − free) for partitions where plist reports meaningful free space (external exFAT/HFS+, etc.). */
function usedBytesFromPartitions(
  wholeId: string,
  diskList: DiskListPhysicalParsed,
  partitionInfoPlists: Record<string, string>,
): number {
  let sum = 0;
  for (const pid of getPartitionIdsForWholeDisk(diskList, wholeId)) {
    const xml = partitionInfoPlists[pid];
    if (!xml) continue;
    const info = parseDiskInfoPlist(xml);
    if (info.totalBytes <= 0 || info.freeBytes == null) continue;
    sum += Math.max(0, info.totalBytes - info.freeBytes);
  }
  return sum;
}

export function buildDiskUsageRows(input: BuildDiskUsageInput): DiskUsageRow[] {
  const usedFromApfsByWhole = new Map<string, number>();
  for (const c of input.apfsContainers) {
    const whole = input.partitionToWholeDisk.get(c.designatedPhysicalStore);
    if (!whole) continue;
    const used = Math.max(0, c.capacityCeiling - c.capacityFree);
    usedFromApfsByWhole.set(whole, (usedFromApfsByWhole.get(whole) ?? 0) + used);
  }

  return input.diskList.wholeDisks.map((id) => {
    const plist = input.diskInfoPlists[id];
    const info = plist ? parseDiskInfoPlist(plist) : null;
    const totalBytes = info?.totalBytes ?? 0;
    const apfsUsed = usedFromApfsByWhole.get(id) ?? 0;

    let usedBytes = apfsUsed;
    if (apfsUsed <= 0 && info?.freeBytes != null && totalBytes > 0) {
      usedBytes = Math.max(0, totalBytes - info.freeBytes);
    }

    if (usedBytes === 0 && totalBytes > 0) {
      const fromParts = usedBytesFromPartitions(
        id,
        input.diskList,
        input.partitionInfoPlists,
      );
      if (fromParts > 0) usedBytes = fromParts;
    }

    if (totalBytes > 0 && usedBytes > totalBytes) {
      usedBytes = totalBytes;
    }

    const label = `${id} — ${displayNameFromInfo(info, id)}`;

    return {
      id,
      label,
      totalBytes,
      usedBytes,
    };
  });
}

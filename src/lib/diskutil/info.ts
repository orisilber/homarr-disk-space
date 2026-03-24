import { parse } from "fast-plist";

export type DiskInfoParsed = {
  deviceIdentifier: string;
  totalBytes: number;
  freeBytes: number | null;
  mediaName: string | null;
};

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function parseDiskInfoPlist(xml: string): DiskInfoParsed {
  const d = parse(xml) as Record<string, unknown>;
  const id =
    typeof d.DeviceIdentifier === "string" ? d.DeviceIdentifier : "unknown";
  const total =
    num(d.TotalSize) || num(d.Size) || num(d.IOKitSize) || num(d.VolumeSize);
  const freeRaw = num(d.FreeSpace);
  const hasMeaningfulFree = freeRaw > 0;
  return {
    deviceIdentifier: id,
    totalBytes: total,
    freeBytes: hasMeaningfulFree ? freeRaw : null,
    mediaName: typeof d.MediaName === "string" ? d.MediaName : null,
  };
}

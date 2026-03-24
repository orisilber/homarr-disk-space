import { parse } from "fast-plist";

export type DiskInfoParsed = {
  deviceIdentifier: string;
  totalBytes: number;
  /** Best-effort free bytes from VolumeFreeSpace or FreeSpace (>0 only). */
  freeBytes: number | null;
  mediaName: string | null;
  ioRegistryEntryName: string | null;
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
  const volFree = num(d.VolumeFreeSpace);
  const freeSpace = num(d.FreeSpace);
  let freeBytes: number | null = null;
  if (volFree > 0) freeBytes = volFree;
  else if (freeSpace > 0) freeBytes = freeSpace;

  const io = d.IORegistryEntryName;
  const media = d.MediaName;

  return {
    deviceIdentifier: id,
    totalBytes: total,
    freeBytes,
    mediaName: typeof media === "string" ? media : null,
    ioRegistryEntryName: typeof io === "string" ? io : null,
  };
}

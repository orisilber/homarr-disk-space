"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { barToneForFreeRatio } from "@/lib/diskutil/colors";
import { filterDisksByIds, parseDiskFilterParam } from "@/lib/diskutil/filter";
import type { DiskUsageRow } from "@/lib/diskutil/types";
import { bytesToGbString } from "@/lib/format-bytes";
import { volumeNameFromDiskLabel } from "@/lib/volume-name";
import { cn } from "@/lib/utils";

const POLL_MS = 5 * 60 * 1000;

type ApiOk = { disks: DiskUsageRow[] };
type ApiErr = { error?: string; disks: DiskUsageRow[] };

function toneClasses(tone: ReturnType<typeof barToneForFreeRatio>) {
  switch (tone) {
    case "green":
      return "bg-emerald-600";
    case "orange":
      return "bg-amber-500";
    case "red":
      return "bg-red-600";
  }
}

export function DiskDashboard() {
  const searchParams = useSearchParams();
  const diskFilter = useMemo(
    () => parseDiskFilterParam(searchParams.get("diskFilter")),
    [searchParams],
  );

  const [rows, setRows] = useState<DiskUsageRow[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/disks", { cache: "no-store" });
      const body = (await res.json()) as ApiOk & ApiErr;
      setRows(filterDisksByIds(body.disks ?? [], diskFilter));
    } catch {
      setRows([]);
    }
  }, [diskFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      {rows.map((d) => {
        const total = d.totalBytes;
        const used = d.usedBytes;
        const freeBytes = Math.max(0, total - used);
        const fillPct =
          total > 0 ? Math.min(100, (freeBytes / total) * 100) : 0;
        const freeRatio = total > 0 ? freeBytes / total : 0;
        const tone = barToneForFreeRatio(freeRatio);
        const taken = bytesToGbString(used);
        const cap = bytesToGbString(total);
        const volumeName = volumeNameFromDiskLabel(d.label, d.id);

        return (
          <div
            key={d.id}
            className="relative h-[3.25rem] w-full overflow-hidden rounded-lg bg-muted"
          >
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-[width] duration-300",
                toneClasses(tone),
              )}
              style={{ width: `${fillPct}%` }}
            />
            <div className="pointer-events-none absolute inset-0 flex min-h-0 flex-col justify-center gap-[6px] px-2.5 py-1">
              <span
                className="min-w-0 w-full truncate text-center text-xs font-medium leading-none text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
                title={volumeName}
              >
                {volumeName}
              </span>
              <span className="text-[0.6875rem] font-medium leading-none tabular-nums text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] text-center">
                {taken} / {cap} GB
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

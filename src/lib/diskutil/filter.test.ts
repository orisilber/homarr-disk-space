import { describe, expect, it } from "vitest";
import type { DiskUsageRow } from "./types";
import { filterDisksByIds, parseDiskFilterParam } from "./filter";

const SAMPLE_ROWS: DiskUsageRow[] = [
  { id: "disk0", label: "A", totalBytes: 1, usedBytes: 0 },
  { id: "disk3", label: "B", totalBytes: 1, usedBytes: 0 },
];

describe("parseDiskFilterParam", () => {
  it("returns null when param is missing or empty", () => {
    expect(parseDiskFilterParam(null)).toBeNull();
    expect(parseDiskFilterParam("")).toBeNull();
    expect(parseDiskFilterParam("   ")).toBeNull();
  });

  it("splits comma-separated ids and normalizes case", () => {
    expect(parseDiskFilterParam("disk1,DISK3")).toEqual(["disk1", "disk3"]);
  });

  it("trims whitespace around tokens", () => {
    expect(parseDiskFilterParam(" disk1 , disk3 ")).toEqual(["disk1", "disk3"]);
  });
});

describe("filterDisksByIds", () => {
  it("returns all rows when filter is null", () => {
    expect(filterDisksByIds(SAMPLE_ROWS, null)).toEqual(SAMPLE_ROWS);
  });

  it("keeps only listed disk ids", () => {
    expect(filterDisksByIds(SAMPLE_ROWS, ["disk3"])).toEqual([SAMPLE_ROWS[1]]);
  });

  it("orders rows to match the filter list (not API order)", () => {
    expect(filterDisksByIds(SAMPLE_ROWS, ["disk3", "disk0"])).toEqual([
      SAMPLE_ROWS[1],
      SAMPLE_ROWS[0],
    ]);
    expect(filterDisksByIds(SAMPLE_ROWS, ["disk0", "disk3"])).toEqual([
      SAMPLE_ROWS[0],
      SAMPLE_ROWS[1],
    ]);
  });
});

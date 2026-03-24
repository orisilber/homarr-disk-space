import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPartitionToWholeDisk, parseDiskListPhysicalPlist } from "./list";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("parseDiskListPhysicalPlist", () => {
  it("reads WholeDisks in plist order", () => {
    const xml = readFileSync(
      join(__dirname, "__fixtures__/list-physical-sample.plist"),
      "utf8",
    );
    const parsed = parseDiskListPhysicalPlist(xml);
    expect(parsed.wholeDisks).toEqual(["disk0", "disk9"]);
  });
});

describe("buildPartitionToWholeDisk", () => {
  it("maps every partition id to its parent whole disk", () => {
    const xml = readFileSync(
      join(__dirname, "__fixtures__/list-physical-sample.plist"),
      "utf8",
    );
    const parsed = parseDiskListPhysicalPlist(xml);
    const map = buildPartitionToWholeDisk(parsed);
    expect(map.get("disk0")).toBe("disk0");
    expect(map.get("disk0s1")).toBe("disk0");
    expect(map.get("disk0s2")).toBe("disk0");
    expect(map.get("disk9")).toBe("disk9");
    expect(map.get("disk9s1")).toBe("disk9");
  });
});

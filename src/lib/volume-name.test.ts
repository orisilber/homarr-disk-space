import { describe, expect, it } from "vitest";
import { volumeNameFromDiskLabel } from "./volume-name";

describe("volumeNameFromDiskLabel", () => {
  it("returns text after the em dash when present", () => {
    expect(volumeNameFromDiskLabel("disk0 — APPLE SSD", "disk0")).toBe(
      "APPLE SSD",
    );
  });

  it("falls back to disk id when media part is empty", () => {
    expect(volumeNameFromDiskLabel("disk0 — ", "disk0")).toBe("disk0");
    expect(volumeNameFromDiskLabel("disk0 —", "disk0")).toBe("disk0");
  });

  it("returns disk id when there is no separator", () => {
    expect(volumeNameFromDiskLabel("disk0", "disk0")).toBe("disk0");
  });
});

import { describe, expect, it } from "vitest";
import { parseApfsListPlist } from "./apfs";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Containers</key>
  <array>
    <dict>
      <key>ContainerReference</key>
      <string>disk3</string>
      <key>DesignatedPhysicalStore</key>
      <string>disk0s2</string>
      <key>CapacityCeiling</key>
      <integer>900</integer>
      <key>CapacityFree</key>
      <integer>400</integer>
    </dict>
    <dict>
      <key>ContainerReference</key>
      <string>disk1</string>
      <key>DesignatedPhysicalStore</key>
      <string>disk0s1</string>
      <key>CapacityCeiling</key>
      <integer>100</integer>
      <key>CapacityFree</key>
      <integer>50</integer>
    </dict>
  </array>
</dict>
</plist>`;

describe("parseApfsListPlist", () => {
  it("extracts designated store and capacity fields per container", () => {
    const rows = parseApfsListPlist(SAMPLE);
    expect(rows).toHaveLength(2);
    expect(rows).toContainEqual({
      designatedPhysicalStore: "disk0s2",
      capacityCeiling: 900,
      capacityFree: 400,
    });
    expect(rows).toContainEqual({
      designatedPhysicalStore: "disk0s1",
      capacityCeiling: 100,
      capacityFree: 50,
    });
  });
});

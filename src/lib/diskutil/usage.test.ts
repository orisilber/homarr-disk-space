import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseApfsListPlist } from "./apfs";
import { buildPartitionToWholeDisk, parseDiskListPhysicalPlist } from "./list";
import { buildDiskUsageRows } from "./usage";

const __dirname = dirname(fileURLToPath(import.meta.url));

const APFS_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Containers</key>
  <array>
    <dict>
      <key>DesignatedPhysicalStore</key>
      <string>disk0s2</string>
      <key>CapacityCeiling</key>
      <integer>900</integer>
      <key>CapacityFree</key>
      <integer>400</integer>
    </dict>
    <dict>
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

const INFO_DISK0 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DeviceIdentifier</key>
  <string>disk0</string>
  <key>TotalSize</key>
  <integer>1000</integer>
  <key>MediaName</key>
  <string>Internal SSD</string>
</dict>
</plist>`;

const INFO_DISK9 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DeviceIdentifier</key>
  <string>disk9</string>
  <key>TotalSize</key>
  <integer>2000</integer>
  <key>FreeSpace</key>
  <integer>500</integer>
  <key>MediaName</key>
  <string>USB Drive</string>
</dict>
</plist>`;

describe("buildDiskUsageRows", () => {
  it("sums APFS container usage onto the owning whole disk", () => {
    const listXml = readFileSync(
      join(__dirname, "__fixtures__/list-physical-sample.plist"),
      "utf8",
    );
    const list = parseDiskListPhysicalPlist(listXml);
    const partMap = buildPartitionToWholeDisk(list);
    const apfs = parseApfsListPlist(APFS_SAMPLE);
    const info = {
      disk0: INFO_DISK0,
      disk9: INFO_DISK9,
    };
    const rows = buildDiskUsageRows({
      wholeDisks: list.wholeDisks,
      partitionToWholeDisk: partMap,
      apfsContainers: apfs,
      diskInfoPlists: info,
    });

    const disk0 = rows.find((r) => r.id === "disk0");
    expect(disk0).toMatchObject({
      id: "disk0",
      label: "disk0 — Internal SSD",
      totalBytes: 1000,
      usedBytes: 550,
    });

    const disk9 = rows.find((r) => r.id === "disk9");
    expect(disk9).toMatchObject({
      id: "disk9",
      label: "disk9 — USB Drive",
      totalBytes: 2000,
      usedBytes: 1500,
    });
  });
});

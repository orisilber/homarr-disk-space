import { describe, expect, it } from "vitest";
import { parseDiskInfoPlist } from "./info";

describe("parseDiskInfoPlist", () => {
  it("reads total, optional free space, and media name", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DeviceIdentifier</key>
  <string>disk4</string>
  <key>TotalSize</key>
  <integer>1000000</integer>
  <key>FreeSpace</key>
  <integer>250000</integer>
  <key>MediaName</key>
  <string>MyDisk</string>
</dict>
</plist>`;
    const p = parseDiskInfoPlist(xml);
    expect(p).toMatchObject({
      deviceIdentifier: "disk4",
      totalBytes: 1000000,
      freeBytes: 250000,
      mediaName: "MyDisk",
      ioRegistryEntryName: null,
    });
  });

  it("prefers VolumeFreeSpace over FreeSpace when both are set", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DeviceIdentifier</key>
  <string>disk5s1</string>
  <key>TotalSize</key>
  <integer>1000</integer>
  <key>FreeSpace</key>
  <integer>100</integer>
  <key>VolumeFreeSpace</key>
  <integer>400</integer>
</dict>
</plist>`;
    const p = parseDiskInfoPlist(xml);
    expect(p.freeBytes).toBe(400);
    expect(p.totalBytes).toBe(1000);
  });

  it("reads IORegistryEntryName", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DeviceIdentifier</key>
  <string>disk0</string>
  <key>IORegistryEntryName</key>
  <string>APPLE SSD AP0512Z Media</string>
  <key>MediaName</key>
  <string>APPLE SSD AP0512Z</string>
  <key>TotalSize</key>
  <integer>500</integer>
</dict>
</plist>`;
    const p = parseDiskInfoPlist(xml);
    expect(p.ioRegistryEntryName).toBe("APPLE SSD AP0512Z Media");
  });

  it("treats FreeSpace 0 as unknown for fallback logic", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DeviceIdentifier</key>
  <string>disk0</string>
  <key>TotalSize</key>
  <integer>500</integer>
  <key>FreeSpace</key>
  <integer>0</integer>
</dict>
</plist>`;
    const p = parseDiskInfoPlist(xml);
    expect(p.freeBytes).toBeNull();
  });
});

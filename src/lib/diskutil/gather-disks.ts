import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { parseApfsListPlist } from "./apfs";
import { buildPartitionToWholeDisk, parseDiskListPhysicalPlist } from "./list";
import { buildDiskUsageRows } from "./usage";

const execFileAsync = promisify(execFile);

export async function gatherDiskUsageFromDiskutil() {
  if (process.platform !== "darwin") {
    throw new Error("diskutil is only available on macOS");
  }

  const opts = {
    encoding: "utf8" as const,
    maxBuffer: 10 * 1024 * 1024,
  };

  const [listResult, apfsResult] = await Promise.all([
    execFileAsync("diskutil", ["list", "-plist", "physical"], opts),
    execFileAsync("diskutil", ["apfs", "list", "-plist"], opts),
  ]);

  const list = parseDiskListPhysicalPlist(listResult.stdout);
  const partitionToWholeDisk = buildPartitionToWholeDisk(list);
  const apfsContainers = parseApfsListPlist(apfsResult.stdout);

  const diskInfoPlists: Record<string, string> = {};
  await Promise.all(
    list.wholeDisks.map(async (id) => {
      try {
        const r = await execFileAsync("diskutil", ["info", "-plist", id], opts);
        diskInfoPlists[id] = r.stdout;
      } catch {
        diskInfoPlists[id] = "";
      }
    }),
  );

  return buildDiskUsageRows({
    wholeDisks: list.wholeDisks,
    partitionToWholeDisk,
    apfsContainers,
    diskInfoPlists,
  });
}

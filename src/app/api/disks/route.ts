import { NextResponse } from "next/server";

import { gatherDiskUsageFromDiskutil } from "@/lib/diskutil/gather-disks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const disks = await gatherDiskUsageFromDiskutil();
    return NextResponse.json({ disks });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: message, disks: [] },
      { status: process.platform === "darwin" ? 500 : 503 },
    );
  }
}

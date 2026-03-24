import { Suspense } from "react";

import { DiskDashboard } from "@/components/disk-dashboard";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <DiskDashboard />
      </Suspense>
    </main>
  );
}

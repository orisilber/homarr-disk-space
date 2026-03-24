export type BarTone = "green" | "orange" | "red";

/** `freeRatio` is free bytes / total bytes in [0,1]. */
export function barToneForFreeRatio(freeRatio: number): BarTone {
  if (freeRatio > 0.5) return "green";
  if (freeRatio >= 0.2) return "orange";
  return "red";
}

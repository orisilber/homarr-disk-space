const GB = 1024 ** 3;

export function bytesToGbString(bytes: number, fractionDigits = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return (0).toFixed(fractionDigits);
  return (bytes / GB).toFixed(fractionDigits);
}

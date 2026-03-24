const LABEL_SEP = " — ";

/** Uses the media name from `diskId — Media` labels; falls back to disk id. */
export function volumeNameFromDiskLabel(label: string, diskId: string): string {
  const i = label.indexOf(LABEL_SEP);
  if (i >= 0) {
    const rest = label.slice(i + LABEL_SEP.length).trim();
    if (rest) return rest;
  }
  return diskId;
}

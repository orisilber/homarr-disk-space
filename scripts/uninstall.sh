#!/usr/bin/env bash
# Remove LaunchAgent for homarr-disk-space (does not delete the repo).
set -euo pipefail

LABEL="com.user.homarr-disk-space"
PLIST_DST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
DOMAIN="gui/$(id -u)"

launchctl bootout "${DOMAIN}" "${PLIST_DST}" 2>/dev/null || true
launchctl bootout "${DOMAIN}" "${LABEL}" 2>/dev/null || true
launchctl unload "${PLIST_DST}" 2>/dev/null || true

if [[ -f "${PLIST_DST}" ]]; then
  rm -f "${PLIST_DST}"
  echo "Removed ${PLIST_DST}"
else
  echo "No plist at ${PLIST_DST}"
fi

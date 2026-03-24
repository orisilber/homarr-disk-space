#!/usr/bin/env bash
# One-shot setup on macOS: deps, production build, Login LaunchAgent, start supervised.
set -euo pipefail

LABEL="com.user.homarr-disk-space"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_DST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
DOMAIN="gui/$(id -u)"

die() {
  echo "error: $*" >&2
  exit 1
}

[[ "$(uname -s)" == "Darwin" ]] || die "this app only runs on macOS"

command -v node >/dev/null 2>&1 || die "Node.js not found. Install from https://nodejs.org or: brew install node"
command -v npm >/dev/null 2>&1 || die "npm not found (should ship with Node.js)"

NODE_BIN="$(command -v node)"
NODE_MAJOR="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
[[ "${NODE_MAJOR}" -ge 18 ]] || die "Node 18+ required (found $(node -v))"

SUPERVISOR_SCRIPT="${REPO_ROOT}/scripts/supervised-start.mjs"
[[ -f "${SUPERVISOR_SCRIPT}" ]] || die "missing ${SUPERVISOR_SCRIPT}"

NO_LAUNCHD=0
for arg in "$@"; do
  case "${arg}" in
    --no-launchd) NO_LAUNCHD=1 ;;
    -h|--help)
      echo "usage: $0 [--no-launchd]"
      echo "  --no-launchd  only npm install, build, and run supervised in the foreground (no login item)"
      exit 0
      ;;
  esac
done

echo "→ repo: ${REPO_ROOT}"
cd "${REPO_ROOT}"

APP_PORT="$(node -p "const p=require('./package.json').homarr?.port; (typeof p==='number'&&p>0)?p:52847")"

echo "→ npm install"
npm install

echo "→ npm run build"
npm run build

mkdir -p "${REPO_ROOT}/logs"

if [[ "${NO_LAUNCHD}" -eq 1 ]]; then
  echo "→ starting supervised mode (foreground, Ctrl+C to stop)"
  echo "   http://127.0.0.1:${APP_PORT}"
  exec node "${SUPERVISOR_SCRIPT}"
fi

echo "→ writing LaunchAgent ${PLIST_DST}"
mkdir -p "${HOME}/Library/LaunchAgents"

NODE_DIR="$(dirname "${NODE_BIN}")"
PATH_FOR_LAUNCHD="${NODE_DIR}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

xml_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}

REPO_XML="$(xml_escape "${REPO_ROOT}")"
NODE_XML="$(xml_escape "${NODE_BIN}")"
SUP_XML="$(xml_escape "${SUPERVISOR_SCRIPT}")"
PATH_XML="$(xml_escape "${PATH_FOR_LAUNCHD}")"
OUT_XML="$(xml_escape "${REPO_ROOT}/logs/launchd.out.log")"
ERR_XML="$(xml_escape "${REPO_ROOT}/logs/launchd.err.log")"
PORT_XML="$(xml_escape "${APP_PORT}")"

# Unload previous registration if any (modern then legacy).
launchctl bootout "${DOMAIN}" "${PLIST_DST}" 2>/dev/null || true
launchctl bootout "${DOMAIN}" "${LABEL}" 2>/dev/null || true
launchctl unload "${PLIST_DST}" 2>/dev/null || true

cat >"${PLIST_DST}" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>${LABEL}</string>
	<key>WorkingDirectory</key>
	<string>${REPO_XML}</string>
	<key>ProgramArguments</key>
	<array>
		<string>${NODE_XML}</string>
		<string>${SUP_XML}</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<true/>
	<key>StandardOutPath</key>
	<string>${OUT_XML}</string>
	<key>StandardErrorPath</key>
	<string>${ERR_XML}</string>
	<key>EnvironmentVariables</key>
	<dict>
		<key>PATH</key>
		<string>${PATH_XML}</string>
		<key>NODE_ENV</key>
		<string>production</string>
		<key>PORT</key>
		<string>${PORT_XML}</string>
	</dict>
</dict>
</plist>
PLIST

echo "→ registering with launchd (${DOMAIN})"
if launchctl bootstrap "${DOMAIN}" "${PLIST_DST}" 2>/dev/null; then
  launchctl enable "${DOMAIN}/${LABEL}" 2>/dev/null || true
  launchctl kickstart -k "${DOMAIN}/${LABEL}" 2>/dev/null || true
else
  echo "   (falling back to launchctl load -w)"
  launchctl load -w "${PLIST_DST}"
  launchctl start "${LABEL}" 2>/dev/null || true
fi

echo ""
echo "Installed. The app will start at login and is running now."
echo "  • UI:    http://127.0.0.1:${APP_PORT}"
echo "  • Crash: ${REPO_ROOT}/logs/crash.log"
echo "  • Stdout: ${REPO_ROOT}/logs/launchd.out.log"
echo ""
echo "To stop and remove the login item:"
echo "  launchctl bootout ${DOMAIN} ${PLIST_DST} 2>/dev/null || launchctl unload ${PLIST_DST}"
echo "  rm ${PLIST_DST}"

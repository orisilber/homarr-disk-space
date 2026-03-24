#!/usr/bin/env node
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logDir = join(root, "logs");
const crashLog = join(logDir, "crash.log");
const backoffMs = 3000;

function stamp() {
  return new Date().toISOString();
}

async function logCrash(message) {
  await mkdir(logDir, { recursive: true });
  await appendFile(crashLog, `[${stamp()}] ${message}\n`, "utf8");
}

function runOnce() {
  return new Promise((resolve) => {
    const nextBin = join(root, "node_modules", ".bin", "next");
    const child = spawn(nextBin, ["start"], {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env },
    });

    child.on("error", async (err) => {
      await logCrash(`spawn error: ${err.message}`);
      resolve();
    });

    child.on("exit", async (code, signal) => {
      const reason =
        signal != null
          ? `exited signal=${signal}`
          : `exited code=${code ?? "unknown"}`;
      await logCrash(`next start ${reason}`);
      resolve();
    });
  });
}

async function main() {
  process.chdir(root);
  for (;;) {
    await runOnce();
    await new Promise((r) => setTimeout(r, backoffMs));
  }
}

main().catch(async (e) => {
  await logCrash(`supervisor fatal: ${e}`);
  process.exit(1);
});

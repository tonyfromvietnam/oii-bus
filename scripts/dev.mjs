#!/usr/bin/env node
// `pnpm dev`: chuẩn bị .env, bật hạ tầng (nếu có Docker), rồi chạy turbo dev cho web + server.
import { spawnSync, spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

const log = (msg) => console.log(`\x1b[33m[oii-bus]\x1b[0m ${msg}`);

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  log("Đã tạo .env từ .env.example");
}

const skipInfra = process.argv.includes("--no-infra") || process.env.OIIBUS_SKIP_INFRA === "1";
const hasDocker = spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0;

if (skipInfra) {
  log("Bỏ qua docker compose (--no-infra).");
} else if (hasDocker) {
  log("Bật postgres, redis, livekit…");
  const up = spawnSync("docker", ["compose", "up", "-d", "--wait"], { stdio: "inherit" });
  if (up.status !== 0) {
    log("docker compose lỗi, vẫn chạy app (các tính năng cần DB sẽ không hoạt động).");
  }
} else {
  log("Không thấy Docker. Chạy app không có postgres/redis/livekit.");
}

const child = spawn("pnpm", ["exec", "turbo", "run", "dev", "--filter=./apps/*"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
const stop = (sig) => child.kill(sig);
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => process.exit(code ?? 0));

import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";
import { loadEnv } from "../src/config";

const baseEnv = {
  NODE_ENV: "test",
  SESSION_SECRET: "x".repeat(32),
  EMAIL_HASH_PEPPER: "pepper-test",
  OIIMATE_BOT_SHARED_SECRET: "bot-secret-test",
};

describe("server status", () => {
  it("/health trả ok", async () => {
    const app = await buildApp({ env: loadEnv(baseEnv) });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.json()).toEqual({ ok: true });
  });

  it("/status đóng giữa tuần, mở khi bật OPEN_OVERRIDE", async () => {
    const wed = () => new Date("2026-11-04T20:00:00Z");
    const closed = await buildApp({ env: loadEnv(baseEnv), now: wed });
    const a = (await closed.inject({ url: "/status" })).json();
    expect(a.open).toBe(false);
    expect(a.nextOpeningAt).toBe("2026-11-06T19:00:00.000Z");

    const forced = await buildApp({ env: loadEnv({ ...baseEnv, OPEN_OVERRIDE: "true" }), now: wed });
    expect((await forced.inject({ url: "/status" })).json().open).toBe(true);
  });

  it("từ chối env thiếu bí mật", () => {
    expect(() => loadEnv({ NODE_ENV: "test" })).toThrow(/SESSION_SECRET/);
  });
});

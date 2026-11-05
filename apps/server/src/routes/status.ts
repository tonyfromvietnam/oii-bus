import { closingAt, isStreetOpen, nextOpeningAt } from "@oii-bus/shared";
import type { FastifyPluginAsync } from "fastify";
import type { Env } from "../config";

export const statusRoutes: FastifyPluginAsync<{ env: Env; now: () => Date }> = async (app, { env, now }) => {
  app.get("/health", async () => ({ ok: true }));

  /** Web dùng để quyết định hiện phố hay trang "Phố đóng cửa". */
  app.get("/status", async () => {
    const t = now();
    const open = isStreetOpen(t, env.OPEN_OVERRIDE);
    return {
      open,
      override: env.OPEN_OVERRIDE,
      serverTime: t.toISOString(),
      closesAt: open ? (closingAt(t)?.toISOString() ?? null) : null,
      nextOpeningAt: nextOpeningAt(t).toISOString(),
    };
  });
};

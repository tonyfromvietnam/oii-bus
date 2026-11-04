import cors from "@fastify/cors";
import Fastify from "fastify";
import type { Env } from "./config";
import { statusRoutes } from "./routes/status";

export interface AppDeps {
  env: Env;
  /** Đồng hồ tiêm vào để test giờ mở cửa. */
  now?: () => Date;
}

export async function buildApp({ env, now = () => new Date() }: AppDeps) {
  const app = Fastify({
    logger: env.NODE_ENV === "test" ? false : { level: env.NODE_ENV === "production" ? "info" : "debug" },
    trustProxy: true,
  });

  await app.register(cors, { origin: env.PUBLIC_WEB_URL, credentials: true });
  await app.register(statusRoutes, { env, now });

  // M2: gắn Colyseus vào cùng HTTP server (app.server).
  // M3: /auth/*, /internal/magic-link. M4: /voice/token. M5: /admin/*, /quests/*.
  return app;
}

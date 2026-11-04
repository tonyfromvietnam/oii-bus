import { z } from "zod";

const bool = z
  .enum(["true", "false", "1", "0", ""])
  .default("false")
  .transform((v) => v === "true" || v === "1");

/** Biến môi trường, validate một lần lúc khởi động. Khớp với .env.example. */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(2567),
  HOST: z.string().default("0.0.0.0"),
  PUBLIC_WEB_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  SESSION_SECRET: z.string().min(32, "SESSION_SECRET cần ≥ 32 ký tự"),
  EMAIL_HASH_PEPPER: z.string().min(8),
  OIIMATE_BOT_SHARED_SECRET: z.string().min(8),
  RESEND_API_KEY: z.string().optional(),

  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),

  OPEN_OVERRIDE: bool,
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Biến môi trường không hợp lệ:\n${issues}`);
  }
  return parsed.data;
}

import { z } from "zod";

const hex64Regex = /^[0-9a-f]{64}$/i;
const hex96Regex = /^[0-9a-f]{96}$/i;
const skPrefixRegex = /^sk-/;

const envSchema = z.object({
  // ── Database ──────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("postgresql://") || url.startsWith("postgres://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),
  DATABASE_POOL_MIN: z.coerce.number().int().min(1).max(50).default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(200).default(20),

  // ── Redis ─────────────────────────────────────────────────
  REDIS_URL: z
    .string()
    .refine((url) => url.startsWith("redis://") || url.startsWith("rediss://"), {
      message: "REDIS_URL must be a Redis connection string",
    }),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  REDIS_PASSWORD: z.string().optional(),

  // ── JWT ───────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, "Must be a valid duration (e.g. 15m, 1h, 7d)")
    .default("15m"),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, "Must be a valid duration (e.g. 15m, 1h, 7d)")
    .default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(16).default(12),

  // ── Encryption (AES-256-GCM) ──────────────────────────────
  ENCRYPTION_KEY: z
    .string()
    .regex(hex64Regex, "ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)"),

  // ── OpenAI ────────────────────────────────────────────────
  OPENAI_API_KEY: z
    .string()
    .refine((key) => key.startsWith("sk-") && key.length > 20, {
      message: "OPENAI_API_KEY must start with 'sk-' and be at least 20 characters",
    }),
  OPENAI_MODEL: z.string().default("gpt-4o"),
  OPENAI_MAX_TOKENS: z.coerce.number().int().min(1).max(128000).default(4096),
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),

  // ── Anthropic ─────────────────────────────────────────────
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-3-opus-20240229"),
  ANTHROPIC_MAX_TOKENS: z.coerce.number().int().min(1).max(200000).default(4096),
  ANTHROPIC_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),

  // ── Slack Connector ───────────────────────────────────────
  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  SLACK_SIGNING_SECRET: z.string().optional(),

  // ── Gmail Connector ───────────────────────────────────────
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),

  // ── Application ───────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://") || url.startsWith("http://localhost"), {
      message: "NEXT_PUBLIC_APP_URL must be HTTPS in production",
    }),
  NEXT_PUBLIC_APP_NAME: z.string().default("FlowMind AI"),
  NODE_ENV: z
    .enum(["development", "production", "test", "staging"])
    .default("development"),

  // ── Socket.io ─────────────────────────────────────────────
  SOCKETIO_PATH: z.string().default("/api/socket"),
  SOCKETIO_CORS_ORIGIN: z.string().optional(),

  // ── BullMQ ────────────────────────────────────────────────
  BULLMQ_PREFIX: z.string().default("flowmind"),
  BULLMQ_DEFAULT_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  BULLMQ_BACKOFF_TYPE: z.enum(["exponential", "fixed"]).default("exponential"),
  BULLMQ_BACKOFF_DELAY: z.coerce.number().int().min(100).max(60000).default(2000),

  // ── Rate Limiting ─────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3600000).default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).max(10000).default(100),

  // ── CORS ──────────────────────────────────────────────────
  CORS_ORIGINS: z
    .string()
    .optional()
    .default("http://localhost:3000"),

  // ── Logging ───────────────────────────────────────────────
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  LOG_PRETTY: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),

  // ── Sentry ────────────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),

  // ── Webhook ───────────────────────────────────────────────
  WEBHOOK_PAYLOAD_MAX_BYTES: z.coerce.number().int().min(1024).max(1048576).default(262144),
  WEBHOOK_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
});

export { envSchema };
export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");
    throw new Error(
      `Environment variable validation failed:\n${formatted}\n\n` +
        "Check your .env file and ensure all required variables are set."
    );
  }
  return result.data;
}

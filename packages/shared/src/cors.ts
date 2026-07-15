/**
 * CORS configuration for FlowMind AI.
 *
 * Reads allowed origins from CORS_ORIGINS env var (comma-separated).
 * In production, this must be an explicit whitelist — never wildcard.
 */

export interface CorsConfig {
  origin: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export function getCorsConfig(): CorsConfig {
  const rawOrigins = process.env["CORS_ORIGINS"] ?? "http://localhost:3000";
  const origins = rawOrigins
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  // In production, validate all origins are HTTPS
  if (process.env["NODE_ENV"] === "production") {
    for (const origin of origins) {
      if (!origin.startsWith("https://")) {
        throw new Error(
          `CORS: origin "${origin}" must use HTTPS in production. ` +
          "Update CORS_ORIGINS environment variable."
        );
      }
    }
  }

  return {
    origin: origins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Api-Key",
      "X-Request-Id",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "X-Request-Id",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  };
}

/**
 * Validate an origin against the CORS whitelist.
 * Returns the origin if allowed, null if rejected.
 */
export function validateCorsOrigin(
  requestOrigin: string | null,
  config: CorsConfig,
): string | null {
  if (!requestOrigin) return null;

  // Exact match against whitelist
  if (config.origin.includes(requestOrigin)) {
    return requestOrigin;
  }

  return null;
}

import pino from "pino";

const isDev = process.env["NODE_ENV"] !== "production";

export const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
  transport: isDev && process.env["LOG_PRETTY"] === "true"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "secret",
      "apiKey",
    ],
    censor: "[REDACTED]",
  },
});

export function createLogger(name: string) {
  return logger.child({ module: name });
}

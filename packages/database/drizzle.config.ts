import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/*.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "postgresql://flowmind:flowmind_pass@localhost:5432/flowmind",
  },
} satisfies Config;

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("database");

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let client: postgres.Sql<{}> | null = null;

export function getConnection() {
  if (db) return db;

  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const poolMin = parseInt(process.env["DATABASE_POOL_MIN"] ?? "2", 10);
  const poolMax = parseInt(process.env["DATABASE_POOL_MAX"] ?? "20", 10);

  logger.info({ poolMin, poolMax }, "Initializing database connection");

  client = postgres(databaseUrl, {
    max: poolMax,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: true,
  });

  db = drizzle(client, { schema, logger: process.env["NODE_ENV"] === "development" });

  return db;
}

export function getClient() {
  if (!client) getConnection();
  return client!;
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
    logger.info("Database connection closed");
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const sql = getClient();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    return false;
  }
}

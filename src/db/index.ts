import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured. Set it in your environment variables (e.g. .env.local).",
  );
}

const client = postgres(connectionString);
export const db = drizzle({ client, schema });

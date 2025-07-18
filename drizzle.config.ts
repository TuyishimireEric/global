import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "test";

const DATABASE_URL =
  NODE_ENV === "test"
    ? process.env.POSTGRES_URL
    : process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  throw new Error("POSTGRES_URL is not defined in the environment variables.");
}

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
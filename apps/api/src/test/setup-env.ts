import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.test")) {
  loadEnvFile(".env.test");
}

process.env.NODE_ENV ??= "test";
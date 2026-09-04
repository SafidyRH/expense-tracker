import { timeout } from "hono/timeout";
import { HTTPException } from "hono/http-exception";

const DEFAULT_TIMEOUT_MS = 10_000;

export const API_TIMEOUT_MS = Number(
  process.env.API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS
);

export function createTimeoutException() {
  return new HTTPException(408, {
    message: "Request processing timed out",
  });
}

export const apiTimeout = timeout(
  API_TIMEOUT_MS,
  createTimeoutException
);
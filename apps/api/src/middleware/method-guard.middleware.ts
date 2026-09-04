import {
  createMiddleware,
} from "hono/factory";
import type { AppEnv } from "../types/app-env.js";
import { MethodNotAllowedError } from "../shared/errors/errors.js";

const ALLOWED_API_METHODS =
  new Set([
    "GET",
    "POST",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ]);

const ALLOW_HEADER =
  Array.from(
    ALLOWED_API_METHODS
  ).join(", ");

export const apiMethodGuard =
  createMiddleware<AppEnv>(
    async (
      c,
      next
    ) => {
      if (
        ALLOWED_API_METHODS.has(
          c.req.method
        )
      ) {
        await next();

        return;
      }

      c.header(
        "Allow",
        ALLOW_HEADER
      );

      throw new MethodNotAllowedError();
    }
  );
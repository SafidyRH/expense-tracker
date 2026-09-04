import {
  createMiddleware,
} from "hono/factory";

import {
  UnsupportedMediaTypeError,
} from "../shared/errors/errors.js";
import type { AppEnv } from "../types/app-env.js";



const METHODS_REQUIRING_JSON =
  new Set([
    "POST",
    "PUT",
    "PATCH",
  ]);

export const requireJsonContentType =
  createMiddleware<AppEnv>(
    async (
      c,
      next
    ) => {
      /*
       * Better Auth gère lui-même
       * les Content-Type dont il
       * a besoin.
       */
      if (
        c.req.path.startsWith(
          "/api/auth/"
        )
      ) {
        await next();

        return;
      }

      if (
        !METHODS_REQUIRING_JSON.has(
          c.req.method
        )
      ) {
        await next();

        return;
      }

      const contentType =
        c.req.header(
          "content-type"
        );

      if (!contentType) {
        throw new UnsupportedMediaTypeError();
      }

      const mediaType =
        contentType
          .split(";")[0]
          ?.trim()
          .toLowerCase();

      const isJson =
        mediaType ===
          "application/json" ||
        (
          mediaType?.startsWith(
            "application/"
          ) &&
          mediaType.endsWith(
            "+json"
          )
        );

      if (!isJson) {
        throw new UnsupportedMediaTypeError();
      }

      await next();
    }
  );
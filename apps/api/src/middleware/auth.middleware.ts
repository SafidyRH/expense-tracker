import {
  createMiddleware,
} from "hono/factory";

import {
  auth,
} from "../lib/auth.js";

import {
  UnauthorizedError,
} from "../shared/errors/errors.js";

import type {
  AppEnv,
} from "../types/app-env.js";

/*
 * On garde cet alias pour ne pas
 * casser immédiatement les routes
 * qui utilisent encore AuthEnv.
 */
export type AuthEnv =
  AppEnv;

export const requireAuth =
  createMiddleware<AppEnv>(
    async (
      c,
      next
    ) => {
      const session =
        await auth.api.getSession({
          headers:
            c.req.raw.headers,
        });

      if (!session) {
        throw new UnauthorizedError(
          "Authentication required"
        );
      }

      c.set(
        "session",
        session
      );

      /*
       * À partir de maintenant,
       * tous les logs de cette
       * requête contiendront userId.
       */
      const currentLogger =
        c.get("logger");

      if (currentLogger) {
        c.set(
          "logger",
          currentLogger.child({
            userId:
              session.user.id,
          })
        );
      }

      await next();
    }
  );
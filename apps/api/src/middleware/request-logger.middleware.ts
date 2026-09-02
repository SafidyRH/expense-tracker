import {
  createMiddleware,
} from "hono/factory";

import {
  logger as rootLogger,
} from "../lib/logger.js";

import type {
  AppEnv,
} from "../types/app-env.js";

const requestIdPattern =
  /^[A-Za-z0-9._:-]{1,100}$/;

export const requestLoggerMiddleware =
  createMiddleware<AppEnv>(
    async (
      c,
      next
    ) => {
      const incomingRequestId =
        c.req.header(
          "x-request-id"
        );

      const requestId =
        incomingRequestId &&
        requestIdPattern.test(
          incomingRequestId
        )
          ? incomingRequestId
          : crypto.randomUUID();

      const startedAt =
        performance.now();

      const requestLogger =
        rootLogger.child({
          requestId,
        });

      c.set(
        "requestId",
        requestId
      );

      c.set(
        "requestStartedAt",
        startedAt
      );

      c.set(
        "logger",
        requestLogger
      );

      c.set(
        "session",
        null
      );

      c.set(
        "handledError",
        null
      );

      /*
       * Permet au frontend et au
       * monitoring de récupérer
       * l'identifiant de requête.
       */
      c.header(
        "X-Request-ID",
        requestId
      );

      await next();

      const durationMs =
        Number(
          (
            performance.now() -
            startedAt
          ).toFixed(2)
        );

      /*
       * Le logger peut avoir été
       * enrichi par requireAuth
       * avec userId.
       */
      const finalLogger =
        c.get("logger") ??
        requestLogger;

      const handledError =
        c.get(
          "handledError"
        );

      const fields = {
        method:
          c.req.method,

        /*
         * On ne logue volontairement
         * pas query params.
         */
        path: new URL(
          c.req.url
        ).pathname,

        status:
          c.res.status,

        durationMs,

        ...(handledError
          ? {
              errorCode:
                handledError.code,
            }
          : {}),
      };

      if (
        c.res.status >= 500
      ) {
        finalLogger.error(
          {
            ...fields,

            ...(handledError
              ?.error
              ? {
                  err:
                    handledError.error,
                }
              : {}),
          },

          "request completed"
        );

        return;
      }

      if (
        c.res.status >= 400
      ) {
        finalLogger.warn(
          fields,
          "request completed"
        );

        return;
      }

      finalLogger.info(
        fields,
        "request completed"
      );
    }
  );
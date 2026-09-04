import type {
  Context,
} from "hono";

import {
  createMiddleware,
} from "hono/factory";

import {
  getConnInfo,
} from "@hono/node-server/conninfo";

import {
  TooManyRequestsError,
} from "../shared/errors/errors.js";

import type {
  AppEnv,
} from "../types/app-env.js";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  limit: number;

  windowMs: number;

  enabled?: boolean;

  keyGenerator?: (
    c: Context<AppEnv>
  ) => string;

  skip?: (
    c: Context<AppEnv>
  ) => boolean;
}

const MAX_BUCKETS =
  10_000;

export function createRateLimitMiddleware(
  options: RateLimitOptions
) {
  const buckets =
    new Map<
      string,
      RateLimitBucket
    >();

  return createMiddleware<AppEnv>(
    async (
      c,
      next
    ) => {
      if (
        options.enabled ===
        false
      ) {
        await next();

        return;
      }

      if (
        options.skip?.(c)
      ) {
        await next();

        return;
      }

      const now =
        Date.now();

      const key =
        options.keyGenerator?.(
          c
        ) ??
        getClientIp(c);

      let bucket =
        buckets.get(key);

      if (
        !bucket ||
        now >=
          bucket.resetAt
      ) {
        bucket = {
          count: 0,

          resetAt:
            now +
            options.windowMs,
        };

        ensureBucketCapacity(
          buckets,
          now
        );

        buckets.set(
          key,
          bucket
        );
      }

      const resetSeconds =
        Math.max(
          1,
          Math.ceil(
            (
              bucket.resetAt -
              now
            ) /
              1000
          )
        );

      /*
       * RateLimit headers
       */
      c.header(
        "RateLimit-Limit",
        String(
          options.limit
        )
      );

      c.header(
        "RateLimit-Reset",
        String(
          Math.ceil(
            bucket.resetAt /
              1000
          )
        )
      );

      /*
       * Limit already reached.
       */
      if (
        bucket.count >=
        options.limit
      ) {
        c.header(
          "RateLimit-Remaining",
          "0"
        );

        c.header(
          "Retry-After",
          String(
            resetSeconds
          )
        );

        throw new TooManyRequestsError(
          "Too many requests. Please try again later."
        );
      }

      bucket.count += 1;

      c.header(
        "RateLimit-Remaining",
        String(
          Math.max(
            0,
            options.limit -
              bucket.count
          )
        )
      );

      await next();
    }
  );
}

function getClientIp(
  c: Context<AppEnv>
) {
  const trustProxy =
    process.env
      .TRUST_PROXY ===
    "true";

  /*
   * Ne faire confiance à
   * X-Forwarded-For que si
   * l'application est derrière
   * notre reverse proxy.
   */
  if (trustProxy) {
    const forwarded =
      c.req.header(
        "x-forwarded-for"
      );

    const firstIp =
      forwarded
        ?.split(",")[0]
        ?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const info =
    getConnInfo(c);

  return (
    info.remote.address ??
    "unknown"
  );
}

function ensureBucketCapacity(
  buckets: Map<
    string,
    RateLimitBucket
  >,
  now: number
) {
  if (
    buckets.size <
    MAX_BUCKETS
  ) {
    return;
  }

  /*
   * Nettoyage des entrées expirées.
   */
  for (
    const [
      key,
      bucket,
    ] of buckets
  ) {
    if (
      bucket.resetAt <=
      now
    ) {
      buckets.delete(
        key
      );
    }
  }

  /*
   * Protection mémoire :
   * si la Map est encore pleine,
   * supprimer l'entrée la plus
   * ancienne.
   */
  if (
    buckets.size >=
    MAX_BUCKETS
  ) {
    const oldestKey =
      buckets
        .keys()
        .next()
        .value;

    if (oldestKey) {
      buckets.delete(
        oldestKey
      );
    }
  }
}

const apiLimit =
  Number(
    process.env
      .API_RATE_LIMIT_MAX ??
      120
  );

const apiWindowMs =
  Number(
    process.env
      .API_RATE_LIMIT_WINDOW_MS ??
      60_000
  );

export const apiRateLimit =
  createRateLimitMiddleware({
    limit:
      apiLimit,

    windowMs:
      apiWindowMs,

    enabled:
      process.env.NODE_ENV !==
      "test",

    /*
     * Better Auth possède
     * déjà son propre limiter.
     */
    skip: (c) =>
      c.req.path.startsWith(
        "/api/auth/"
      ),
  });
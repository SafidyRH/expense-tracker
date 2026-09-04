import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Hono,
} from "hono";

import {
  createRateLimitMiddleware,
} from "../rate-limit.middleware";

import {
  errorHandler,
} from "../../shared/errors/error-handler";

import type {
  AppEnv,
} from "../../types/app-env";

describe(
  "rate limit middleware",
  () => {
    it(
      "returns 429 when the limit is exceeded",
      async () => {
        const app =
          new Hono<AppEnv>();

        app.onError(
          errorHandler
        );

        const limiter =
          createRateLimitMiddleware({
            limit: 2,

            windowMs:
              60_000,

            enabled: true,

            keyGenerator:
              () =>
                "test-client",
          });

        app.use(
          "/test",
          limiter
        );

        app.get(
          "/test",
          (c) =>
            c.json({
              ok: true,
            })
        );

        const first =
          await app.request(
            "/test"
          );

        const second =
          await app.request(
            "/test"
          );

        const third =
          await app.request(
            "/test"
          );

        expect(
          first.status
        ).toBe(200);

        expect(
          second.status
        ).toBe(200);

        expect(
          third.status
        ).toBe(429);

        expect(
          third.headers.get(
            "retry-after"
          )
        ).toBeTruthy();

        expect(
          await third.json()
        ).toEqual({
          error: {
            code:
              "RATE_LIMITED",

            message:
              "Too many requests. Please try again later.",
          },
        });

        expect(
        first.headers.get(
            "ratelimit-limit"
        )
        ).toBe("2");

        expect(
        first.headers.get(
            "ratelimit-remaining"
        )
        ).toBe("1");

        expect(
        second.headers.get(
            "ratelimit-remaining"
        )
        ).toBe("0");
      }
    );
  }
);
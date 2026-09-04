import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Hono,
} from "hono";

import {
  requestLoggerMiddleware,
} from "../request-logger.middleware";

import {
  errorHandler,
} from "../../shared/errors/error-handler";

import type {
  AppEnv,
} from "../../types/app-env";

function createTestApp() {
  const app =
    new Hono<AppEnv>();

  app.onError(
    errorHandler
  );

  app.use(
    "*",
    requestLoggerMiddleware
  );

  return app;
}

describe(
  "requestLoggerMiddleware",
  () => {
    it(
      "adds a request id to the response",
      async () => {
        const app =
          createTestApp();

        app.get(
          "/test",
          (c) =>
            c.json({
              ok: true,
            })
        );

        const response =
          await app.request(
            "/test"
          );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.headers.get(
            "x-request-id"
          )
        ).toBeTruthy();
      }
    );

    it(
      "preserves a valid incoming request id",
      async () => {
        const app =
          createTestApp();

        app.get(
          "/test",
          (c) =>
            c.json({
              ok: true,
            })
        );

        const response =
          await app.request(
            "/test",
            {
              headers: {
                "X-Request-ID":
                  "test-request-123",
              },
            }
          );

        expect(
          response.headers.get(
            "x-request-id"
          )
        ).toBe(
          "test-request-123"
        );
      }
    );

    it(
      "replaces an invalid request id",
      async () => {
        const app =
          createTestApp();

        app.get(
          "/test",
          (c) =>
            c.json({
              ok: true,
            })
        );

        const response =
          await app.request(
            "/test",
            {
              headers: {
                "X-Request-ID":
                  "invalid request id !!!",
              },
            }
          );

        const requestId =
          response.headers.get(
            "x-request-id"
          );

        expect(
          requestId
        ).toBeTruthy();

        expect(
          requestId
        ).not.toBe(
          "invalid request id !!!"
        );
      }
    );
  }
);
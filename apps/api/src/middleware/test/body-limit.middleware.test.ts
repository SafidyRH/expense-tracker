import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Hono,
} from "hono";

import {
  apiBodyLimit,
} from "../body-limit.middleware.js";

import {
  errorHandler,
} from "../../shared/errors/error-handler.js";

import type {
  AppEnv,
} from "../../types/app-env.js";

describe(
  "apiBodyLimit",
  () => {
    it(
      "accepts a small request body",
      async () => {
        const app =
          new Hono<AppEnv>();

        app.onError(
          errorHandler
        );

        app.post(
          "/test",
          apiBodyLimit,
          async (c) => {
            const body =
              await c.req.json();

            return c.json(
              body
            );
          }
        );

        const response =
          await app.request(
            "/test",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  hello:
                    "world",
                }),
            }
          );

        expect(
          response.status
        ).toBe(200);
      }
    );

    it(
      "rejects a body larger than 64 KiB",
      async () => {
        const app =
          new Hono<AppEnv>();

        app.onError(
          errorHandler
        );

        app.post(
          "/test",
          apiBodyLimit,
          async (c) => {
            await c.req.json();

            return c.json({
              ok: true,
            });
          }
        );

        const response =
          await app.request(
            "/test",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  data:
                    "x".repeat(
                      70_000
                    ),
                }),
            }
          );

        expect(
          response.status
        ).toBe(413);

        expect(
          await response.json()
        ).toEqual({
          error: {
            code:
              "PAYLOAD_TOO_LARGE",

            message:
              "Request body is too large",
          },
        });
      }
    );
  }
);
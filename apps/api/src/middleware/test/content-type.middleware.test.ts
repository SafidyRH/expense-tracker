import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Hono,
} from "hono";
import { AppEnv } from "../../types/app-env";
import { errorHandler } from "../../shared/errors/error-handler";
import {
  requireJsonContentType,
} from "../content-type.middleware";



function createTestApp() {
  const app =
    new Hono<AppEnv>();

  app.onError(
    errorHandler
  );

  app.use(
    "/api/*",
    requireJsonContentType
  );

  app.post(
    "/api/test",
    async (c) => {
      const data =
        await c.req.json();

      return c.json(
        data
      );
    }
  );

  return app;
}

describe(
  "requireJsonContentType",
  () => {
    it(
      "accepts application/json",
      async () => {
        const app =
          createTestApp();

        const response =
          await app.request(
            "/api/test",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  ok: true,
                }),
            }
          );

        expect(
          response.status
        ).toBe(200);
      }
    );

    it(
      "accepts application/json with charset",
      async () => {
        const app =
          createTestApp();

        const response =
          await app.request(
            "/api/test",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json; charset=utf-8",
              },

              body:
                "{}",
            }
          );

        expect(
          response.status
        ).toBe(200);
      }
    );

    it(
      "rejects text/plain",
      async () => {
        const app =
          createTestApp();

        const response =
          await app.request(
            "/api/test",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "text/plain",
              },

              body:
                "hello",
            }
          );

        expect(
          response.status
        ).toBe(415);

        expect(
          await response.json()
        ).toEqual({
          error: {
            code:
              "UNSUPPORTED_MEDIA_TYPE",

            message:
              "Content-Type must be application/json",
          },
        });
      }
    );
  }
);
import {
  describe,
  expect,
  it,
} from "vitest";

import { Hono } from "hono";
import { timeout } from "hono/timeout";
import { AppEnv } from "../../types/app-env";
import { errorHandler } from "../../shared/errors/error-handler";

import {
  createTimeoutException,
} from "../timeout.middleware";

describe("API timeout", () => {
  it(
    "returns 408 when the request exceeds the timeout",
    async () => {
      const app =
        new Hono<AppEnv>();

      app.onError(
        errorHandler
      );

      app.use(
        "/slow",
        timeout(
          20,
          createTimeoutException
        )
      );

      app.get(
        "/slow",
        async (c) => {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                100
              )
          );

          return c.json({
            ok: true,
          });
        }
      );

      const response =
        await app.request(
          "/slow"
        );

      expect(
        response.status
      ).toBe(408);

      expect(
        await response.json()
      ).toEqual({
        error: {
          code:
            "REQUEST_TIMEOUT",

          message:
            "Request processing timed out",
        },
      });
    }
  );
});
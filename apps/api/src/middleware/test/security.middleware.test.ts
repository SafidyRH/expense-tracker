import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Hono,
} from "hono";

import {
  securityHeaders,
} from "../security.middleware";

describe(
  "securityHeaders",
  () => {
    it(
      "adds security headers",
      async () => {
        const app =
          new Hono();

        app.use(
          "*",
          securityHeaders
        );

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
          response.headers.get(
            "x-content-type-options"
          )
        ).toBe(
          "nosniff"
        );

        expect(
          response.headers.get(
            "x-frame-options"
          )
        ).toBe(
          "DENY"
        );

        expect(
          response.headers.get(
            "referrer-policy"
          )
        ).toBe(
          "no-referrer"
        );
      }
    );
  }
);
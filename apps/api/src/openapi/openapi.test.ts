import {
  describe,
  expect,
  it,
} from "vitest";

import app from "../app.js";

describe("OpenAPI document", () => {
  it("documents the first-party API route inventory", async () => {
    const response =
      await app.request(
        "/openapi.json"
      );

    expect(response.status).toBe(200);

    const document =
      await response.json() as {
        paths: Record<
          string,
          Record<string, unknown>
        >;
      };

    expect(document.paths).toMatchObject({
      "/": {
        get: expect.any(Object),
      },
      "/health": {
        get: expect.any(Object),
      },
      "/me": {
        get: expect.any(Object),
      },
      "/api/accounts": {
        get: expect.any(Object),
        post: expect.any(Object),
      },
      "/api/accounts/{id}": {
        get: expect.any(Object),
        patch: expect.any(Object),
        delete: expect.any(Object),
      },
      "/api/categories": {
        get: expect.any(Object),
        post: expect.any(Object),
      },
      "/api/categories/{id}": {
        patch: expect.any(Object),
        delete: expect.any(Object),
      },
      "/api/budgets": {
        get: expect.any(Object),
      },
      "/api/budgets/global": {
        put: expect.any(Object),
      },
      "/api/budgets/categories/{categoryId}": {
        put: expect.any(Object),
        delete: expect.any(Object),
      },
      "/api/transactions": {
        get: expect.any(Object),
      },
      "/api/transactions/expenses": {
        post: expect.any(Object),
      },
      "/api/transactions/incomes": {
        post: expect.any(Object),
      },
      "/api/transactions/transfers": {
        post: expect.any(Object),
      },
    });
  });
});

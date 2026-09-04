import {
  readdirSync,
  readFileSync,
} from "node:fs";
import {
  dirname,
  join,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  describe,
  expect,
  it,
} from "vitest";

import app from "../app.js";
import {
  createSecurityInventory,
  findSecurityInventoryViolations,
} from "./security-inventory.js";

interface OpenApiDocument {
  paths: Record<
    string,
    Record<string, unknown>
  >;
  components?: {
    securitySchemes?: Record<
      string,
      unknown
    >;
  };
}

describe("OpenAPI document", () => {
  it("documents the first-party API route inventory", async () => {
    const document =
      await readOpenApiDocument();

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
      "/api/auth/sign-in/email": {
        post: expect.any(Object),
      },
      "/api/auth/sign-up/email": {
        post: expect.any(Object),
      },
      "/api/auth/get-session": {
        get: expect.any(Object),
      },
      "/api/auth/sign-out": {
        post: expect.any(Object),
      },
    });
  });

  it("uses OpenAPI as the security inventory source of truth", async () => {
    const document =
      await readOpenApiDocument();

    const inventory =
      createSecurityInventory(
        document
      );

    expect(
      findSecurityInventoryViolations(
        inventory
      )
    ).toEqual([]);

    expect(inventory).toContainEqual(
      expect.objectContaining({
        method: "GET",
        path: "/api/accounts",
        auth: "protected",
        responses: [
          "200",
          "401",
          "429",
        ],
      })
    );

    expect(inventory).toContainEqual(
      expect.objectContaining({
        method: "POST",
        path: "/api/transactions/expenses",
        auth: "protected",
        requestContentTypes: [
          "application/json",
        ],
        ownership:
          "account-and-category-must-be-available-to-user",
      })
    );

    expect(inventory).toContainEqual(
      expect.objectContaining({
        method: "POST",
        path: "/api/auth/sign-in/email",
        auth: "public",
      })
    );

    expect(
      document.components
        ?.securitySchemes
        ?.sessionCookie
    ).toMatchObject({
      type: "apiKey",
      in: "cookie",
    });
  });

  it("does not allow first-party API routes to bypass OpenAPI", () => {
    const sourceRoot =
      join(
        dirname(
          fileURLToPath(
            import.meta.url
          )
        ),
        ".."
      );

    const rawModuleRoutes =
      findFiles(
        join(sourceRoot, "modules")
      ).flatMap((filePath) => {
        if (
          !filePath.endsWith(
            ".routes.ts"
          )
        ) {
          return [];
        }

        const source =
          readFileSync(
            filePath,
            "utf8"
          );

        return [
          ...source.matchAll(
            /\w+Routes\.(get|post|put|patch|delete)\s*\(/g
          ),
        ].map(
          (match) =>
            `${filePath}: ${match[0]}`
        );
      });

    expect(rawModuleRoutes).toEqual([]);

    const appSource =
      readFileSync(
        join(sourceRoot, "app.ts"),
        "utf8"
      );

    const rawAppApiRoutes = [
      ...appSource.matchAll(
        /app\.(get|post|put|patch|delete|all)\s*\(\s*["'`]([^"'`]+)["'`]/g
      ),
    ]
      .map((match) => ({
        method: match[1],
        path: match[2],
      }))
      .filter(
        (route) =>
          route.path.startsWith("/api/") &&
          route.path !== "/api/auth/*"
      );

    expect(rawAppApiRoutes).toEqual([]);
  });
});

async function readOpenApiDocument() {
  const response =
    await app.request(
      "/openapi.json"
    );

  expect(response.status).toBe(200);

  return response.json() as Promise<OpenApiDocument>;
}

function findFiles(
  directoryPath: string
): string[] {
  return readdirSync(
    directoryPath,
    {
      withFileTypes: true,
    }
  ).flatMap((entry) => {
    const entryPath =
      join(
        directoryPath,
        entry.name
      );

    return entry.isDirectory()
      ? findFiles(entryPath)
      : [
          entryPath,
        ];
  });
}

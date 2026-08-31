import { randomUUID } from "node:crypto";

import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import {
  createIntegrationApp,
} from "../../../test/hono-app.js";
import {
  authHeaders,
  cleanupAllTestUsers,
  cleanupTestUsers,
  createTestAccount,
  createTestCategory,
  createTestUser,
  parseJson,
} from "../../../test/database.js";

describe("budgets integration", () => {
  const app = createIntegrationApp();
  const userIds: string[] = [];

  beforeAll(async () => {
    await cleanupAllTestUsers();
  });

  afterEach(async () => {
    await cleanupTestUsers(
      userIds.splice(0)
    );
  });

  it("recalculates budget progress from expense allocations", async () => {
    const user = await createTestUser();
    userIds.push(user.id);
    const account =
      await createTestAccount({
        userId: user.id,
        initialBalanceMinor: 100_000n,
      });
    const category =
      await createTestCategory({
        userId: user.id,
        type: "EXPENSE",
        name: "Food",
      });

    await app.request(
      "/api/budgets/global",
      {
        method: "PUT",
        headers: authHeaders(user.id),
        body: JSON.stringify({
          month: "2026-01",
          amountMinor: "100000",
          currencyCode: "MGA",
        }),
      }
    );

    await app.request(
      `/api/budgets/categories/${category.id}`,
      {
        method: "PUT",
        headers: authHeaders(user.id),
        body: JSON.stringify({
          month: "2026-01",
          amountMinor: "60000",
          currencyCode: "MGA",
        }),
      }
    );

    await app.request(
      "/api/transactions/expenses",
      {
        method: "POST",
        headers: authHeaders(user.id),
        body: JSON.stringify({
          accountId: account.id,
          categoryId: category.id,
          amountMinor: "25000",
          occurredAt:
            "2026-01-15T10:00:00.000Z",
          clientGeneratedId:
            randomUUID(),
        }),
      }
    );

    const response =
      await app.request(
        "/api/budgets?month=2026-01",
        {
          headers: authHeaders(user.id),
        }
      );

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: {
          global: {
            amountMinor: string;
            spentMinor: string;
            remainingMinor: string;
            percentConsumed: number;
          };
          categories: Array<{
            amountMinor: string;
            spentMinor: string;
            remainingMinor: string;
            percentConsumed: number;
            category: {
              id: string;
            };
          }>;
        };
      }>(response);

    expect(body.data.global).toMatchObject({
      amountMinor: "100000",
      spentMinor: "25000",
      remainingMinor: "75000",
      percentConsumed: 25,
    });
    expect(body.data.categories).toHaveLength(1);
    expect(body.data.categories[0]).toMatchObject({
      amountMinor: "60000",
      spentMinor: "25000",
      remainingMinor: "35000",
      percentConsumed: 41.66,
      category: {
        id: category.id,
      },
    });
  });
});

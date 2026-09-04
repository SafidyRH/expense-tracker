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
  prisma,
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

  it("scopes budget overview to the authenticated user", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const categoryB =
      await createTestCategory({
        userId: userB.id,
        type: "EXPENSE",
        name: "User B food",
      });

    await prisma.monthlyGlobalBudget.create({
      data: {
        userId: userB.id,
        month: new Date(
          "2026-02-01T00:00:00.000Z"
        ),
        amountMinor: 500_000n,
        currencyCode: "MGA",
      },
    });

    await prisma.monthlyCategoryBudget.create({
      data: {
        userId: userB.id,
        categoryId: categoryB.id,
        month: new Date(
          "2026-02-01T00:00:00.000Z"
        ),
        amountMinor: 300_000n,
        currencyCode: "MGA",
      },
    });

    const response =
      await app.request(
        "/api/budgets?month=2026-02",
        {
          headers:
            authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: {
          global: {
            amountMinor: string;
          };
          categories: Array<{
            category: {
              id: string;
            };
          }>;
        };
      }>(response);

    expect(body.data.global.amountMinor).toBe("0");
    expect(body.data.categories).toHaveLength(0);
  });

  it("rejects BOLA category budget upserts with another user's category", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const categoryB =
      await createTestCategory({
        userId: userB.id,
        type: "EXPENSE",
      });

    await prisma.monthlyGlobalBudget.create({
      data: {
        userId: userA.id,
        month: new Date(
          "2026-03-01T00:00:00.000Z"
        ),
        amountMinor: 100_000n,
        currencyCode: "MGA",
      },
    });

    const response =
      await app.request(
        `/api/budgets/categories/${categoryB.id}`,
        {
          method: "PUT",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            month: "2026-03",
            amountMinor: "10000",
            currencyCode: "MGA",
          }),
        }
      );

    expect(response.status).toBe(404);

    const created =
      await prisma.monthlyCategoryBudget.findMany({
        where: {
          userId: userA.id,
          categoryId: categoryB.id,
        },
      });

    expect(created).toHaveLength(0);
  });

  it("does not delete another user's category budget", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const categoryB =
      await createTestCategory({
        userId: userB.id,
        type: "EXPENSE",
      });

    const budgetB =
      await prisma.monthlyCategoryBudget.create({
        data: {
          userId: userB.id,
          categoryId: categoryB.id,
          month: new Date(
            "2026-04-01T00:00:00.000Z"
          ),
          amountMinor: 25_000n,
          currencyCode: "MGA",
        },
      });

    const response =
      await app.request(
        `/api/budgets/categories/${categoryB.id}?month=2026-04`,
        {
          method: "DELETE",
          headers:
            authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(204);

    const unchanged =
      await prisma.monthlyCategoryBudget.findUnique({
        where: {
          id: budgetB.id,
        },
      });

    expect(unchanged).not.toBeNull();
  });

  it("ignores BOPLA fields when upserting a global budget", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const response =
      await app.request(
        "/api/budgets/global",
        {
          method: "PUT",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            userId: userB.id,
            month: "2026-05",
            amountMinor: "125000",
            currencyCode: "MGA",
          }),
        }
      );

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: {
          id: string;
          userId?: string;
        };
      }>(response);

    expect(body.data.userId).toBeUndefined();

    const budget =
      await prisma.monthlyGlobalBudget.findUniqueOrThrow({
        where: {
          id: body.data.id,
        },
      });

    expect(budget.userId).toBe(userA.id);
  });
});

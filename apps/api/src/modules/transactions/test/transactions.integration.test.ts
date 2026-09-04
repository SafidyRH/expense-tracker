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

type TransactionResponse = {
  data: {
    id: string;
    accountId?: string;
    fromAccountId?: string;
    toAccountId?: string;
    amountMinor: string;
    balanceAfterMinor?: string;
    fromBalanceAfterMinor?: string;
    toBalanceAfterMinor?: string;
  };
  meta: {
    duplicated: boolean;
  };
};

describe("transactions integration", () => {
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

  it("creates an expense and decrements the account balance", async () => {
    const { user, account, category } =
      await createExpenseFixture(100_000n);

    const response =
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

    expect(response.status).toBe(201);

    const body =
      await parseJson<TransactionResponse>(
        response
      );

    expect(body.data).toMatchObject({
      accountId: account.id,
      amountMinor: "25000",
      balanceAfterMinor: "75000",
    });

    await expectAccountBalance(
      account.id,
      75_000n
    );
  });

  it("creates an income and increments the account balance", async () => {
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
        type: "INCOME",
        name: "Salary",
      });

    const response =
      await app.request(
        "/api/transactions/incomes",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify({
            accountId: account.id,
            categoryId: category.id,
            amountMinor: "40000",
            occurredAt:
              "2026-01-15T10:00:00.000Z",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(201);

    const body =
      await parseJson<TransactionResponse>(
        response
      );

    expect(body.data).toMatchObject({
      accountId: account.id,
      amountMinor: "40000",
      balanceAfterMinor: "140000",
    });

    await expectAccountBalance(
      account.id,
      140_000n
    );
  });

  it("creates a transfer and updates both account balances", async () => {
    const user = await createTestUser();
    userIds.push(user.id);
    const source =
      await createTestAccount({
        userId: user.id,
        name: "Source",
        initialBalanceMinor: 100_000n,
      });
    const destination =
      await createTestAccount({
        userId: user.id,
        name: "Destination",
        initialBalanceMinor: 10_000n,
      });

    const response =
      await app.request(
        "/api/transactions/transfers",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify({
            fromAccountId: source.id,
            toAccountId: destination.id,
            amountMinor: "30000",
            occurredAt:
              "2026-01-15T10:00:00.000Z",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(201);

    const body =
      await parseJson<TransactionResponse>(
        response
      );

    expect(body.data).toMatchObject({
      fromAccountId: source.id,
      toAccountId: destination.id,
      amountMinor: "30000",
      fromBalanceAfterMinor: "70000",
      toBalanceAfterMinor: "40000",
    });

    await expectAccountBalance(
      source.id,
      70_000n
    );
    await expectAccountBalance(
      destination.id,
      40_000n
    );
  });

  it("keeps expense creation idempotent by clientGeneratedId", async () => {
    const { user, account, category } =
      await createExpenseFixture(100_000n);
    const clientGeneratedId = randomUUID();
    const payload = {
      accountId: account.id,
      categoryId: category.id,
      amountMinor: "25000",
      occurredAt:
        "2026-01-15T10:00:00.000Z",
      clientGeneratedId,
    };

    const first =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify(payload),
        }
      );

    const second =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify(payload),
        }
      );

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);

    const firstBody =
      await parseJson<TransactionResponse>(
        first
      );
    const secondBody =
      await parseJson<TransactionResponse>(
        second
      );

    expect(firstBody.meta.duplicated).toBe(
      false
    );
    expect(secondBody.meta.duplicated).toBe(
      true
    );
    expect(secondBody.data.id).toBe(
      firstBody.data.id
    );

    await expectAccountBalance(
      account.id,
      75_000n
    );
  });

  it("does not expose another user's transaction history", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    await createExpenseThroughHttp(userA.id);
    await createExpenseThroughHttp(userB.id);

    const response =
      await app.request(
        "/api/transactions?limit=20",
        {
          headers: authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: Array<{
          id: string;
          entries: Array<{
            account: {
              id: string;
            };
          }>;
        }>;
      }>(response);

    expect(body.data).toHaveLength(1);
    expect(
      body.data[0].entries[0].account.id
    ).toBeDefined();
  });

  it("rejects an income category for an expense", async () => {
    const user = await createTestUser();
    userIds.push(user.id);
    const account =
      await createTestAccount({
        userId: user.id,
      });
    const incomeCategory =
      await createTestCategory({
        userId: user.id,
        type: "INCOME",
      });

    const response =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify({
            accountId: account.id,
            categoryId: incomeCategory.id,
            amountMinor: "1000",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(404);
  });

  it("rejects an archived account", async () => {
    const user = await createTestUser();
    userIds.push(user.id);
    const account =
      await createTestAccount({
        userId: user.id,
        isArchived: true,
      });
    const category =
      await createTestCategory({
        userId: user.id,
        type: "EXPENSE",
      });

    const response =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify({
            accountId: account.id,
            categoryId: category.id,
            amountMinor: "1000",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(404);
  });

  it("rejects BOLA expense creation with another user's account", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountB =
      await createTestAccount({
        userId: userB.id,
        initialBalanceMinor: 100_000n,
      });
    const categoryA =
      await createTestCategory({
        userId: userA.id,
        type: "EXPENSE",
      });

    const response =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            accountId: accountB.id,
            categoryId: categoryA.id,
            amountMinor: "1000",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(404);
    await expectAccountBalance(
      accountB.id,
      100_000n
    );
  });

  it("rejects BOLA expense creation with another user's category", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountA =
      await createTestAccount({
        userId: userA.id,
        initialBalanceMinor: 100_000n,
      });
    const categoryB =
      await createTestCategory({
        userId: userB.id,
        type: "EXPENSE",
      });

    const response =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            accountId: accountA.id,
            categoryId: categoryB.id,
            amountMinor: "1000",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(404);
    await expectAccountBalance(
      accountA.id,
      100_000n
    );
  });

  it("rejects BOLA transfers to another user's account", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const sourceA =
      await createTestAccount({
        userId: userA.id,
        initialBalanceMinor: 100_000n,
      });
    const destinationB =
      await createTestAccount({
        userId: userB.id,
        initialBalanceMinor: 10_000n,
      });

    const response =
      await app.request(
        "/api/transactions/transfers",
        {
          method: "POST",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            fromAccountId:
              sourceA.id,
            toAccountId:
              destinationB.id,
            amountMinor: "1000",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(404);
    await expectAccountBalance(
      sourceA.id,
      100_000n
    );
    await expectAccountBalance(
      destinationB.id,
      10_000n
    );
  });

  it("ignores BOPLA fields when creating an expense", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountA =
      await createTestAccount({
        userId: userA.id,
        initialBalanceMinor: 100_000n,
      });
    const categoryA =
      await createTestCategory({
        userId: userA.id,
        type: "EXPENSE",
      });

    const response =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            userId: userB.id,
            type: "INCOME",
            status: "CANCELLED",
            accountId: accountA.id,
            categoryId: categoryA.id,
            amountMinor: "1000",
            clientGeneratedId:
              randomUUID(),
          }),
        }
      );

    expect(response.status).toBe(201);

    const body =
      await parseJson<{
        data: {
          id: string;
          type: string;
          userId?: string;
        };
      }>(response);

    expect(body.data.userId).toBeUndefined();
    expect(body.data.type).toBe("EXPENSE");

    const transaction =
      await prisma.transaction.findUniqueOrThrow({
        where: {
          id: body.data.id,
        },
      });

    expect(transaction.userId).toBe(userA.id);
    expect(transaction.type).toBe("EXPENSE");
    expect(transaction.status).toBe("CONFIRMED");
  });

  it("returns 400 for invalid UUID payloads", async () => {
    const user = await createTestUser();
    userIds.push(user.id);

    const response =
      await app.request(
        "/api/transactions/expenses",
        {
          method: "POST",
          headers: authHeaders(user.id),
          body: JSON.stringify({
            accountId: "not-a-uuid",
            categoryId: randomUUID(),
            amountMinor: "1000",
          }),
        }
      );

    expect(response.status).toBe(400);
  });

  it("filters transaction history", async () => {
    const user = await createTestUser();
    userIds.push(user.id);
    const account =
      await createTestAccount({
        userId: user.id,
      });
    const expenseCategory =
      await createTestCategory({
        userId: user.id,
        type: "EXPENSE",
      });
    const incomeCategory =
      await createTestCategory({
        userId: user.id,
        type: "INCOME",
      });

    await app.request(
      "/api/transactions/expenses",
      {
        method: "POST",
        headers: authHeaders(user.id),
        body: JSON.stringify({
          accountId: account.id,
          categoryId: expenseCategory.id,
          amountMinor: "1000",
          occurredAt:
            "2026-01-15T10:00:00.000Z",
          clientGeneratedId:
            randomUUID(),
        }),
      }
    );

    await app.request(
      "/api/transactions/incomes",
      {
        method: "POST",
        headers: authHeaders(user.id),
        body: JSON.stringify({
          accountId: account.id,
          categoryId: incomeCategory.id,
          amountMinor: "2000",
          occurredAt:
            "2026-01-16T10:00:00.000Z",
          clientGeneratedId:
            randomUUID(),
        }),
      }
    );

    const response =
      await app.request(
        "/api/transactions?type=EXPENSE&limit=20",
        {
          headers: authHeaders(user.id),
        }
      );

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: Array<{
          type: string;
          allocations: Array<{
            category: {
              id: string;
            };
          }>;
        }>;
      }>(response);

    expect(body.data).toHaveLength(1);
    expect(body.data[0].type).toBe("EXPENSE");
    expect(
      body.data[0].allocations[0].category.id
    ).toBe(expenseCategory.id);
  });

  async function createExpenseFixture(
    initialBalanceMinor: bigint
  ) {
    const user = await createTestUser();
    userIds.push(user.id);
    const account =
      await createTestAccount({
        userId: user.id,
        initialBalanceMinor,
      });
    const category =
      await createTestCategory({
        userId: user.id,
        type: "EXPENSE",
      });

    return {
      user,
      account,
      category,
    };
  }

  async function createExpenseThroughHttp(
    userId: string
  ) {
    const account =
      await createTestAccount({
        userId,
        initialBalanceMinor: 100_000n,
      });
    const category =
      await createTestCategory({
        userId,
        type: "EXPENSE",
      });

    return app.request(
      "/api/transactions/expenses",
      {
        method: "POST",
        headers: authHeaders(userId),
        body: JSON.stringify({
          accountId: account.id,
          categoryId: category.id,
          amountMinor: "1000",
          clientGeneratedId:
            randomUUID(),
        }),
      }
    );
  }
});

async function expectAccountBalance(
  accountId: string,
  expectedBalanceMinor: bigint
) {
  const account =
    await prisma.financialAccount.findUniqueOrThrow({
      where: {
        id: accountId,
      },
    });

  expect(account.cachedBalanceMinor).toBe(
    expectedBalanceMinor
  );
}

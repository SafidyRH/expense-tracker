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
  createTestUser,
  parseJson,
  prisma,
} from "../../../test/database.js";

describe("accounts integration", () => {
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

  it("returns 401 without an authenticated user", async () => {
    const response =
      await app.request("/api/accounts");

    expect(response.status).toBe(401);
  });

  it("returns 400 for an invalid account UUID", async () => {
    const user = await createTestUser();
    userIds.push(user.id);

    const response =
      await app.request(
        "/api/accounts/not-a-uuid",
        {
          headers: authHeaders(user.id),
        }
      );

    expect(response.status).toBe(400);
  });

  it("does not expose another user's accounts", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountA =
      await createTestAccount({
        userId: userA.id,
        name: "User A cash",
      });

    await createTestAccount({
      userId: userB.id,
      name: "User B cash",
    });

    const response =
      await app.request("/api/accounts", {
        headers: authHeaders(userA.id),
      });

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: Array<{
          id: string;
          name: string;
        }>;
      }>(response);

    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      id: accountA.id,
      name: "User A cash",
    });
  });

  it("rejects BOLA access to another user's account by id", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountB =
      await createTestAccount({
        userId: userB.id,
        name: "User B bank",
      });

    const response =
      await app.request(
        `/api/accounts/${accountB.id}`,
        {
          headers:
            authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(404);
  });

  it("rejects BOLA updates to another user's account", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountB =
      await createTestAccount({
        userId: userB.id,
        name: "User B cash",
      });

    const response =
      await app.request(
        `/api/accounts/${accountB.id}`,
        {
          method: "PATCH",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            name: "Hijacked",
          }),
        }
      );

    expect(response.status).toBe(404);

    const unchanged =
      await prisma.financialAccount.findUniqueOrThrow({
        where: {
          id: accountB.id,
        },
      });

    expect(unchanged.name).toBe(
      "User B cash"
    );
  });

  it("rejects BOLA archive attempts against another user's account", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const accountB =
      await createTestAccount({
        userId: userB.id,
      });

    const response =
      await app.request(
        `/api/accounts/${accountB.id}`,
        {
          method: "DELETE",
          headers:
            authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(404);

    const unchanged =
      await prisma.financialAccount.findUniqueOrThrow({
        where: {
          id: accountB.id,
        },
      });

    expect(unchanged.isArchived).toBe(false);
  });

  it("ignores BOPLA fields when creating an account", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const response =
      await app.request(
        "/api/accounts",
        {
          method: "POST",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            userId: userB.id,
            name: "Main cash",
            type: "CASH",
            initialBalanceMinor: "1000",
            cachedBalanceMinor: "999999",
            isArchived: true,
          }),
        }
      );

    expect(response.status).toBe(201);

    const body =
      await parseJson<{
        data: {
          id: string;
          userId?: string;
          balanceMinor: string;
          isArchived: boolean;
        };
      }>(response);

    expect(body.data.userId).toBeUndefined();
    expect(body.data.balanceMinor).toBe("1000");
    expect(body.data.isArchived).toBe(false);

    const account =
      await prisma.financialAccount.findUniqueOrThrow({
        where: {
          id: body.data.id,
        },
      });

    expect(account.userId).toBe(userA.id);
    expect(account.cachedBalanceMinor).toBe(1000n);
    expect(account.isArchived).toBe(false);
  });

  it("ignores BOPLA fields when updating an account", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const account =
      await createTestAccount({
        userId: userA.id,
        initialBalanceMinor: 5000n,
      });

    const response =
      await app.request(
        `/api/accounts/${account.id}`,
        {
          method: "PATCH",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            userId: userB.id,
            name: "Renamed",
            cachedBalanceMinor: "999999",
            isArchived: true,
          }),
        }
      );

    expect(response.status).toBe(200);

    const updated =
      await prisma.financialAccount.findUniqueOrThrow({
        where: {
          id: account.id,
        },
      });

    expect(updated.userId).toBe(userA.id);
    expect(updated.name).toBe("Renamed");
    expect(updated.cachedBalanceMinor).toBe(5000n);
    expect(updated.isArchived).toBe(false);
  });
});

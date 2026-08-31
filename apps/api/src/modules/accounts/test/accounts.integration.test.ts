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
});

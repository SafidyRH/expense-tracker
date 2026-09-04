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
  createTestCategory,
  createTestUser,
  parseJson,
  prisma,
} from "../../../test/database.js";

describe("categories security integration", () => {
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

  it("does not expose another user's custom categories", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const categoryA =
      await createTestCategory({
        userId: userA.id,
        name: "User A food",
      });

    await createTestCategory({
      userId: userB.id,
      name: "User B food",
    });

    const response =
      await app.request(
        "/api/categories",
        {
          headers:
            authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(200);

    const body =
      await parseJson<{
        data: Array<{
          id: string;
          name: string;
          userId?: string;
          isArchived?: boolean;
        }>;
      }>(response);

    expect(
      body.data.map(
        (category) => category.id
      )
    ).toContain(categoryA.id);
    expect(
      body.data.some(
        (category) =>
          category.name ===
          "User B food"
      )
    ).toBe(false);
    expect(
      body.data.every(
        (category) =>
          category.userId === undefined &&
          category.isArchived === undefined
      )
    ).toBe(true);
  });

  it("rejects BOLA updates to another user's category", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const categoryB =
      await createTestCategory({
        userId: userB.id,
        name: "Original",
      });

    const response =
      await app.request(
        `/api/categories/${categoryB.id}`,
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
      await prisma.category.findUniqueOrThrow({
        where: {
          id: categoryB.id,
        },
      });

    expect(unchanged.name).toBe("Original");
  });

  it("rejects BOLA archive attempts against another user's category", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const categoryB =
      await createTestCategory({
        userId: userB.id,
      });

    const response =
      await app.request(
        `/api/categories/${categoryB.id}`,
        {
          method: "DELETE",
          headers:
            authHeaders(userA.id),
        }
      );

    expect(response.status).toBe(404);

    const unchanged =
      await prisma.category.findUniqueOrThrow({
        where: {
          id: categoryB.id,
        },
      });

    expect(unchanged.isArchived).toBe(false);
  });

  it("ignores BOPLA fields when creating a category", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    userIds.push(userA.id, userB.id);

    const response =
      await app.request(
        "/api/categories",
        {
          method: "POST",
          headers:
            authHeaders(userA.id),
          body: JSON.stringify({
            userId: userB.id,
            name: "Food",
            type: "EXPENSE",
            icon: "tag",
            isSystem: true,
            isArchived: true,
            systemKey: "admin-only",
            sortOrder: 999,
          }),
        }
      );

    expect(response.status).toBe(201);

    const body =
      await parseJson<{
        data: {
          id: string;
          userId?: string;
          isArchived?: boolean;
        };
      }>(response);

    expect(body.data.userId).toBeUndefined();
    expect(body.data.isArchived).toBeUndefined();

    const category =
      await prisma.category.findUniqueOrThrow({
        where: {
          id: body.data.id,
        },
      });

    expect(category.userId).toBe(userA.id);
    expect(category.isSystem).toBe(false);
    expect(category.isArchived).toBe(false);
    expect(category.systemKey).toBeNull();
    expect(category.sortOrder).toBe(0);
  });
});

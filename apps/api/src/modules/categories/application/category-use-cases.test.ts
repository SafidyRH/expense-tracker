import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ArchiveCategory,
} from "./archive-category.js";
import {
  CreateCategory,
} from "./create-category.js";
import {
  ListCategories,
} from "./list-category.js";
import {
  UpdateCategory,
} from "./update-category.js";

import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../domain/category.js";
import type {
  CategoryRepository,
} from "../domain/category.repository.js";

describe("category use cases", () => {
  const now = new Date("2026-01-15T10:00:00.000Z");

  function createCategoryRecord(
    overrides: Partial<Category> = {}
  ): Category {
    return {
      id: "category-1",
      userId: "user-1",
      name: "Groceries",
      type: "EXPENSE",
      icon: "shopping-basket",
      systemKey: null,
      parentId: null,
      isSystem: false,
      isArchived: false,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  function createRepository(
    category = createCategoryRecord()
  ): CategoryRepository {
    return {
      create: vi.fn(
        async (input: CreateCategoryInput) =>
          createCategoryRecord(input)
      ),
      findAvailableForUser: vi.fn(async () => [
        category,
      ]),
      updateCustomCategory: vi.fn(
        async (
          _id: string,
          _userId: string,
          input: UpdateCategoryInput
        ) =>
          createCategoryRecord({
            ...category,
            ...input,
          })
      ),
      archiveCustomCategory: vi.fn(
        async () => true
      ),
    };
  }

  it("creates a custom category through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new CreateCategory(repository);

    const input: CreateCategoryInput = {
      userId: "user-1",
      name: "Salary",
      type: "INCOME",
      icon: "wallet",
    };

    const result =
      await useCase.execute(input);

    expect(repository.create).toHaveBeenCalledWith(
      input
    );
    expect(result).toMatchObject({
      userId: "user-1",
      name: "Salary",
      type: "INCOME",
      icon: "wallet",
    });
  });

  it("lists available categories for a user and optional type", async () => {
    const category = createCategoryRecord();
    const repository = createRepository(category);
    const useCase =
      new ListCategories(repository);

    await expect(
      useCase.execute("user-1", "EXPENSE")
    ).resolves.toEqual([category]);

    expect(
      repository.findAvailableForUser
    ).toHaveBeenCalledWith("user-1", "EXPENSE");
  });

  it("updates a custom category through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new UpdateCategory(repository);
    const input: UpdateCategoryInput = {
      name: "Food",
      icon: "utensils",
    };

    const result = await useCase.execute(
      "category-1",
      "user-1",
      input
    );

    expect(
      repository.updateCustomCategory
    ).toHaveBeenCalledWith(
      "category-1",
      "user-1",
      input
    );
    expect(result).toMatchObject(input);
  });

  it("archives a custom category through the repository", async () => {
    const repository = createRepository();
    const useCase =
      new ArchiveCategory(repository);

    await expect(
      useCase.execute("category-1", "user-1")
    ).resolves.toBe(true);

    expect(
      repository.archiveCustomCategory
    ).toHaveBeenCalledWith(
      "category-1",
      "user-1"
    );
  });
});

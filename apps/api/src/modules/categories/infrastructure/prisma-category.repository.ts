import { prisma } from "@expense-tracker/database";

import type {
  Category,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../domain/category.js";

import type {
  CategoryRepository,
} from "../domain/category.repository.js";

export class PrismaCategoryRepository
  implements CategoryRepository
{
  async create(
    input: CreateCategoryInput
  ): Promise<Category> {
    return prisma.category.create({
      data: {
        userId: input.userId,

        name: input.name,

        type: input.type,

        icon: input.icon ?? null,

        isSystem: false,

        isArchived: false,
      },
    });
  }

  async findAvailableForUser(
    userId: string,
    type?: CategoryType
  ): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        isArchived: false,

        ...(type && {
          type,
        }),

        OR: [
          {
            isSystem: true,
          },
          {
            userId,
          },
        ],
      },

      orderBy: [
        {
          type: "asc",
        },
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  async updateCustomCategory(
    id: string,
    userId: string,
    input: UpdateCategoryInput
  ): Promise<Category | null> {
    const result =
      await prisma.category.updateMany({
        where: {
          id,
          userId,

          isSystem: false,
          isArchived: false,
        },

        data: {
          ...(input.name !== undefined && {
            name: input.name,
          }),

          ...(input.icon !== undefined && {
            icon: input.icon,
          }),
        },
      });

    if (result.count === 0) {
      return null;
    }

    return prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async archiveCustomCategory(
    id: string,
    userId: string
  ): Promise<boolean> {
    const result =
      await prisma.category.updateMany({
        where: {
          id,
          userId,

          isSystem: false,
          isArchived: false,
        },

        data: {
          isArchived: true,
        },
      });

    return result.count > 0;
  }
}
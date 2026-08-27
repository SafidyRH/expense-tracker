import { Hono } from "hono";

import {
  zValidator,
} from "@hono/zod-validator";

import { prisma } from "@expense-tracker/database";

import type {
  AuthEnv,
} from "../../../middleware/auth.middleware.js";

import {
  requireAuth,
} from "../../../middleware/auth.middleware.js";

import {
  budgetCategoryParamSchema,
  budgetMonthSchema,
  upsertBudgetSchema,
} from "./budget.schemas.js";

export const budgetRoutes =
  new Hono<AuthEnv>();

budgetRoutes.use(
  "*",
  requireAuth
);

budgetRoutes.get(
  "/",

  zValidator(
    "query",
    budgetMonthSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const { month } =
      c.req.valid("query");

    const range =
      getMonthRange(month);

    const [
      globalBudget,
      categoryBudgets,
      globalSpent,
      categorySpent,
    ] = await Promise.all([
      prisma.monthlyGlobalBudget.findUnique({
        where: {
          userId_month: {
            userId:
              session!.user.id,

            month:
              range.start,
          },
        },
      }),

      prisma.monthlyCategoryBudget.findMany({
        where: {
          userId:
            session!.user.id,

          month:
            range.start,
        },

        include: {
          category: true,
        },

        orderBy: {
          category: {
            sortOrder: "asc",
          },
        },
      }),

      prisma.transactionAllocation.aggregate({
        where: {
          transaction: {
            userId:
              session!.user.id,

            type: "EXPENSE",

            deletedAt: null,

            occurredAt: {
              gte: range.start,
              lte: range.end,
            },
          },
        },

        _sum: {
          amountMinor: true,
        },
      }),

      prisma.transactionAllocation.groupBy({
        by: [
          "categoryId",
        ],

        where: {
          transaction: {
            userId:
              session!.user.id,

            type: "EXPENSE",

            deletedAt: null,

            occurredAt: {
              gte: range.start,
              lte: range.end,
            },
          },
        },

        _sum: {
          amountMinor: true,
        },
      }),
    ]);

    const spentByCategory =
      new Map(
        categorySpent.map((item) => [
          item.categoryId,
          item._sum.amountMinor ?? 0n,
        ])
      );

    const globalAmount =
      globalBudget?.amountMinor ?? 0n;

    const spentMinor =
      globalSpent._sum.amountMinor ??
      0n;

    return c.json({
      data: {
        month,

        global:
          toBudgetProgress({
            id:
              globalBudget?.id ?? null,

            amountMinor:
              globalAmount,

            spentMinor,

            currencyCode:
              globalBudget?.currencyCode ??
              "MGA",
          }),

        categories:
          categoryBudgets.map(
            (budget) => {
              const categorySpentMinor =
                spentByCategory.get(
                  budget.categoryId
                ) ?? 0n;

              return {
                ...toBudgetProgress({
                  id: budget.id,

                  amountMinor:
                    budget.amountMinor,

                  spentMinor:
                    categorySpentMinor,

                  currencyCode:
                    budget.currencyCode,
                }),

                category: {
                  id: budget.category.id,

                  name:
                    budget.category.name,

                  icon:
                    budget.category.icon,
                },
              };
            }
          ),
      },
    });
  }
);

budgetRoutes.put(
  "/global",

  zValidator(
    "json",
    upsertBudgetSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const range =
      getMonthRange(input.month);

    const budget =
      await prisma.monthlyGlobalBudget.upsert({
        where: {
          userId_month: {
            userId:
              session!.user.id,

            month:
              range.start,
          },
        },

        update: {
          amountMinor:
            BigInt(
              input.amountMinor
            ),

          currencyCode:
            input.currencyCode,
        },

        create: {
          userId:
            session!.user.id,

          month:
            range.start,

          amountMinor:
            BigInt(
              input.amountMinor
            ),

          currencyCode:
            input.currencyCode,
        },
      });

    return c.json({
      data:
        toBudgetRecord(budget),
    });
  }
);

budgetRoutes.put(
  "/categories/:categoryId",

  zValidator(
    "param",
    budgetCategoryParamSchema
  ),

  zValidator(
    "json",
    upsertBudgetSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const { categoryId } =
      c.req.valid("param");

    const input =
      c.req.valid("json");

    const category =
      await prisma.category.findFirst({
        where: {
          id: categoryId,

          type: "EXPENSE",

          isArchived: false,

          OR: [
            {
              isSystem: true,
            },
            {
              userId:
                session!.user.id,
            },
          ],
        },
      });

    if (!category) {
      return c.json(
        {
          error: {
            code:
              "CATEGORY_NOT_FOUND",

            message:
              "Expense category not found",
          },
        },
        404
      );
    }

    const range =
      getMonthRange(input.month);

    const budget =
      await prisma.monthlyCategoryBudget.upsert({
        where: {
          userId_month_categoryId: {
            userId:
              session!.user.id,

            month:
              range.start,

            categoryId,
          },
        },

        update: {
          amountMinor:
            BigInt(
              input.amountMinor
            ),

          currencyCode:
            input.currencyCode,
        },

        create: {
          userId:
            session!.user.id,

          categoryId,

          month:
            range.start,

          amountMinor:
            BigInt(
              input.amountMinor
            ),

          currencyCode:
            input.currencyCode,
        },
      });

    return c.json({
      data: {
        ...toBudgetRecord(budget),

        category: {
          id: category.id,

          name: category.name,

          icon: category.icon,
        },
      },
    });
  }
);

budgetRoutes.delete(
  "/categories/:categoryId",

  zValidator(
    "param",
    budgetCategoryParamSchema
  ),

  zValidator(
    "query",
    budgetMonthSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const { categoryId } =
      c.req.valid("param");

    const { month } =
      c.req.valid("query");

    const range =
      getMonthRange(month);

    await prisma.monthlyCategoryBudget.deleteMany({
      where: {
        userId:
          session!.user.id,

        categoryId,

        month:
          range.start,
      },
    });

    return c.body(null, 204);
  }
);

function getMonthRange(month: string) {
  const [year, monthNumber] =
    month.split("-").map(Number);

  const start =
    new Date(
      Date.UTC(
        year,
        monthNumber - 1,
        1,
        0,
        0,
        0,
        0
      )
    );

  const end =
    new Date(
      Date.UTC(
        year,
        monthNumber,
        0,
        23,
        59,
        59,
        999
      )
    );

  return {
    start,
    end,
  };
}

function toBudgetRecord(budget: {
  id: string;
  month: Date;
  amountMinor: bigint;
  currencyCode: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: budget.id,

    month:
      formatBudgetMonth(
        budget.month
      ),

    amountMinor:
      budget.amountMinor.toString(),

    currencyCode:
      budget.currencyCode,

    createdAt:
      budget.createdAt.toISOString(),

    updatedAt:
      budget.updatedAt.toISOString(),
  };
}

function toBudgetProgress({
  id,
  amountMinor,
  spentMinor,
  currencyCode,
}: {
  id: string | null;
  amountMinor: bigint;
  spentMinor: bigint;
  currencyCode: string;
}) {
  const remainingMinor =
    amountMinor - spentMinor;

  const percentConsumed =
    amountMinor > 0n
      ? Number(
          (spentMinor * 10000n) /
            amountMinor
        ) / 100
      : 0;

  return {
    id,

    amountMinor:
      amountMinor.toString(),

    spentMinor:
      spentMinor.toString(),

    remainingMinor:
      remainingMinor.toString(),

    percentConsumed,

    currencyCode,
  };
}

function formatBudgetMonth(
  date: Date
) {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

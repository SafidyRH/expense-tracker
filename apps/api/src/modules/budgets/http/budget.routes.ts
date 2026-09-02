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
  ConflictError,
  NotFoundError,
} from "../../../shared/errors/index.js";

import {
  throwOnValidationError,
} from "../../../shared/validation/zod-validator.js";

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
    budgetMonthSchema,
    throwOnValidationError
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

    const allocatedCategoryAmountMinor =
      categoryBudgets.reduce(
        (total, budget) =>
          total +
          budget.amountMinor,
        0n
      );

    const spentInCategoryBudgetsMinor =
      categoryBudgets.reduce(
        (total, budget) =>
          total +
          (spentByCategory.get(
            budget.categoryId
          ) ?? 0n),
        0n
      );

    const spentOutsideCategoryBudgetsMinor =
      spentMinor -
      spentInCategoryBudgetsMinor;

    const unallocatedAmountMinor =
      globalAmount -
      allocatedCategoryAmountMinor;

    const currencyCode =
      globalBudget?.currencyCode ??
      "MGA";

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
              currencyCode,
          }),

        allocation: {
          allocatedCategoryAmountMinor:
            allocatedCategoryAmountMinor.toString(),

          spentInCategoryBudgetsMinor:
            spentInCategoryBudgetsMinor.toString(),

          spentOutsideCategoryBudgetsMinor:
            spentOutsideCategoryBudgetsMinor.toString(),

          unallocated:
            toBudgetProgress({
              id: null,

              amountMinor:
                unallocatedAmountMinor,

              spentMinor:
                spentOutsideCategoryBudgetsMinor,

              currencyCode,
            }),
        },

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
    upsertBudgetSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const range =
      getMonthRange(input.month);

    const amountMinor =
      BigInt(input.amountMinor);

    const categoryBudgetTotal =
      await prisma.monthlyCategoryBudget.aggregate({
        where: {
          userId:
            session!.user.id,

          month:
            range.start,
        },

        _sum: {
          amountMinor: true,
        },
      });

    const allocatedMinor =
      categoryBudgetTotal._sum.amountMinor ??
      0n;

    if (allocatedMinor > amountMinor) {
      throw new ConflictError(
        "Le budget mensuel ne peut pas être inférieur aux enveloppes déjà allouées.",
        "GLOBAL_BUDGET_TOO_LOW"
      );
    }

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
            amountMinor,

          currencyCode:
            input.currencyCode,
        },

        create: {
          userId:
            session!.user.id,

          month:
            range.start,

          amountMinor:
            amountMinor,

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
    budgetCategoryParamSchema,
    throwOnValidationError
  ),

  zValidator(
    "json",
    upsertBudgetSchema,
    throwOnValidationError
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
      throw new NotFoundError(
        "Expense category not found",
        "CATEGORY_NOT_FOUND"
      );
    }

    const range =
      getMonthRange(input.month);

    const amountMinor =
      BigInt(input.amountMinor);

    const [
      globalBudget,
      otherCategoryBudgets,
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

      prisma.monthlyCategoryBudget.aggregate({
        where: {
          userId:
            session!.user.id,

          month:
            range.start,

          categoryId: {
            not: categoryId,
          },
        },

        _sum: {
          amountMinor: true,
        },
      }),
    ]);

    if (!globalBudget) {
      throw new ConflictError(
        "Définissez d'abord le budget mensuel avant d'allouer une catégorie.",
        "GLOBAL_BUDGET_REQUIRED"
      );
    }

    const allocatedMinor =
      (otherCategoryBudgets._sum
        .amountMinor ?? 0n) +
      amountMinor;

    if (
      allocatedMinor >
      globalBudget.amountMinor
    ) {
      throw new ConflictError(
        "La somme des enveloppes catégorie ne peut pas dépasser le budget mensuel.",
        "CATEGORY_BUDGET_EXCEEDS_GLOBAL"
      );
    }

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
            amountMinor,

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
            amountMinor,

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
    budgetCategoryParamSchema,
    throwOnValidationError
  ),

  zValidator(
    "query",
    budgetMonthSchema,
    throwOnValidationError
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

    alert:
      toBudgetAlert({
        amountMinor,
        percentConsumed,
      }),

    currencyCode,
  };
}

function toBudgetAlert({
  amountMinor,
  percentConsumed,
}: {
  amountMinor: bigint;
  percentConsumed: number;
}) {
  if (amountMinor <= 0n) {
    return null;
  }

  if (percentConsumed > 100) {
    return {
      level: "OVER_BUDGET",
      threshold: 100,
      severity: "critical",
      label: "Dépassement",
    };
  }

  if (percentConsumed >= 100) {
    return {
      level: "HUNDRED_PERCENT",
      threshold: 100,
      severity: "danger",
      label: "100 %",
    };
  }

  if (percentConsumed >= 80) {
    return {
      level: "EIGHTY_PERCENT",
      threshold: 80,
      severity: "warning",
      label: "80 %",
    };
  }

  if (percentConsumed >= 50) {
    return {
      level: "FIFTY_PERCENT",
      threshold: 50,
      severity: "info",
      label: "50 %",
    };
  }

  return null;
}

function formatBudgetMonth(
  date: Date
) {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

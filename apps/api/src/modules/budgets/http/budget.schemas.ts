import {
  z,
} from "@hono/zod-openapi";

const monthSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}$/,
    "Month must use YYYY-MM format"
  )
  .openapi({
    example: "2026-01",
  });

const moneyMinorSchema = z
  .string()
  .regex(
    /^\d+$/,
    "Amount must be a positive integer represented as a string"
  )
  .refine(
    (value) => BigInt(value) >= 0n,
    {
      message:
        "Amount must be greater than or equal to zero",
    }
  )
  .openapi({
    example: "250000",
  });

const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) =>
    value.toUpperCase()
  )
  .openapi({
    example: "MGA",
  });

export const budgetMonthSchema =
  z
    .object({
      month:
        monthSchema.openapi({
          param: {
            name: "month",
            in: "query",
          },
        }),
    })
    .openapi(
      "BudgetMonthQuery"
    );

export const budgetCategoryParamSchema =
  z
    .object({
      categoryId:
        z
          .string()
          .uuid()
          .openapi({
            param: {
              name: "categoryId",
              in: "path",
            },

            example:
              "550e8400-e29b-41d4-a716-446655440000",
          }),
    })
    .openapi(
      "BudgetCategoryParam"
    );

export const upsertBudgetSchema =
  z
    .object({
      month:
        monthSchema,

      amountMinor:
        moneyMinorSchema,

      currencyCode:
        currencySchema.default("MGA"),
    })
    .openapi(
      "UpsertBudget"
    );

export const BudgetAlertSchema =
  z
    .object({
      level: z.enum([
        "FIFTY_PERCENT",
        "EIGHTY_PERCENT",
        "HUNDRED_PERCENT",
        "OVER_BUDGET",
      ]),

      threshold: z.union([
        z.literal(50),
        z.literal(80),
        z.literal(100),
      ]),

      severity: z.enum([
        "info",
        "warning",
        "danger",
        "critical",
      ]),

      label:
        z.string().openapi({
          example: "80 %",
        }),
    })
    .openapi(
      "BudgetAlert"
    );

export const BudgetProgressSchema =
  z
    .object({
      id: z
        .string()
        .uuid()
        .nullable(),

      amountMinor:
        z.string().openapi({
          example: "250000",
        }),

      spentMinor:
        z.string().openapi({
          example: "125000",
        }),

      remainingMinor:
        z.string().openapi({
          example: "125000",
        }),

      percentConsumed:
        z.number().openapi({
          example: 50,
        }),

      alert:
        BudgetAlertSchema.nullable(),

      currencyCode:
        z.string().length(3).openapi({
          example: "MGA",
        }),
    })
    .openapi(
      "BudgetProgress"
    );

export const BudgetRecordSchema =
  z
    .object({
      id: z.string().uuid(),

      month:
        monthSchema,

      amountMinor:
        z.string().openapi({
          example: "250000",
        }),

      currencyCode:
        z.string().length(3).openapi({
          example: "MGA",
        }),

      createdAt:
        z.string().datetime(),

      updatedAt:
        z.string().datetime(),
    })
    .openapi(
      "BudgetRecord"
    );

export const CategoryBudgetRecordSchema =
  BudgetRecordSchema
    .extend({
      category: z.object({
        id: z.string().uuid(),
        name: z.string(),
        icon:
          z.string().nullable(),
      }),
    })
    .openapi(
      "CategoryBudgetRecord"
    );

export const CategoryBudgetProgressSchema =
  BudgetProgressSchema
    .extend({
      category: z.object({
        id: z.string().uuid(),
        name: z.string(),
        icon:
          z.string().nullable(),
      }),
    })
    .openapi(
      "CategoryBudgetProgress"
    );

export const BudgetOverviewSchema =
  z
    .object({
      month:
        monthSchema,

      global:
        BudgetProgressSchema,

      allocation: z.object({
        allocatedCategoryAmountMinor:
          z.string(),

        spentInCategoryBudgetsMinor:
          z.string(),

        spentOutsideCategoryBudgetsMinor:
          z.string(),

        unallocated:
          BudgetProgressSchema,
      }),

      categories:
        z.array(
          CategoryBudgetProgressSchema
        ),
    })
    .openapi(
      "BudgetOverview"
    );

export const BudgetOverviewResponseSchema =
  z
    .object({
      data:
        BudgetOverviewSchema,
    })
    .openapi(
      "BudgetOverviewResponse"
    );

export const BudgetRecordResponseSchema =
  z
    .object({
      data:
        BudgetRecordSchema,
    })
    .openapi(
      "BudgetRecordResponse"
    );

export const CategoryBudgetRecordResponseSchema =
  z
    .object({
      data:
        CategoryBudgetRecordSchema,
    })
    .openapi(
      "CategoryBudgetRecordResponse"
    );

import { z } from "zod";

export const budgetMonthSchema =
  z.object({
    month: z
      .string()
      .regex(
        /^\d{4}-\d{2}$/,
        "Month must use YYYY-MM format"
      ),
  });

export const budgetCategoryParamSchema =
  z.object({
    categoryId:
      z.string().uuid(),
  });

export const upsertBudgetSchema =
  z.object({
    month: z
      .string()
      .regex(
        /^\d{4}-\d{2}$/,
        "Month must use YYYY-MM format"
      ),

    amountMinor: z
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
      ),

    currencyCode: z
      .string()
      .trim()
      .length(3)
      .transform((value) =>
        value.toUpperCase()
      )
      .default("MGA"),
  });

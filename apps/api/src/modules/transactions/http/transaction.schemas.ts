import { z } from "zod";

const positiveAmountSchema = z
  .string()
  .regex(
    /^\d+$/,
    "Amount must be a positive integer represented as a string"
  )
  .refine(
    (value) => BigInt(value) > 0n,
    {
      message:
        "Amount must be greater than zero",
    }
  );

export const createExpenseSchema =
  z.object({
    accountId: z.string().uuid(),

    categoryId: z.string().uuid(),

    amountMinor:
      positiveAmountSchema,

    description: z
      .string()
      .trim()
      .max(255)
      .nullable()
      .optional(),

    note: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional(),

    occurredAt: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),

    clientGeneratedId: z
      .string()
      .uuid()
      .optional(),
  });
import { z } from "zod";
import {
  transactionTypes,
} from "../domain/transaction-history.js";

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

export const transactionHistoryQuerySchema =
  z
    .object({
      type: z
        .enum(transactionTypes)
        .optional(),

      accountId: z
        .string()
        .uuid()
        .optional(),

      categoryId: z
        .string()
        .uuid()
        .optional(),

      dateFrom: z
        .string()
        .datetime({
          offset: true,
        })
        .optional(),

      dateTo: z
        .string()
        .datetime({
          offset: true,
        })
        .optional(),

      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

      cursor: z
        .string()
        .min(1)
        .optional(),
    })
    .superRefine(
      (
        value,
        context
      ) => {
        if (
          value.dateFrom &&
          value.dateTo &&
          new Date(
            value.dateFrom
          ) >
            new Date(
              value.dateTo
            )
        ) {
          context.addIssue({
            code: "custom",

            path: [
              "dateTo",
            ],

            message:
              "dateTo must be greater than or equal to dateFrom",
          });
        }
      }
    );
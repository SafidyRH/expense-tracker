import {
  z,
} from "@hono/zod-openapi";

import {
  transactionTypes,
} from "../domain/transaction-history.js";

export const TransactionTypeSchema =
  z.enum(
    transactionTypes
  ).openapi(
    "TransactionType"
  );

export const TransactionStatusSchema =
  z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
  ]).openapi(
    "TransactionStatus"
  );

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
  )
  .openapi({
    example: "25000",
  });

const optionalTransactionTextSchema =
  z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional();

const optionalTransactionNoteSchema =
  z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional();

const occurredAtSchema =
  z
    .string()
    .datetime({
      offset: true,
    })
    .optional()
    .openapi({
      example:
        "2026-01-15T10:00:00.000Z",
    });

export const createExpenseSchema =
  z
    .object({
      accountId: z
        .string()
        .uuid(),

      categoryId: z
        .string()
        .uuid(),

      amountMinor:
        positiveAmountSchema,

      description:
        optionalTransactionTextSchema,

      note:
        optionalTransactionNoteSchema,

      occurredAt:
        occurredAtSchema,

      clientGeneratedId: z
        .string()
        .uuid()
        .optional(),
    })
    .openapi(
      "CreateExpense"
    );

export const createIncomeSchema =
  z
    .object({
      accountId: z
        .string()
        .uuid(),

      categoryId: z
        .string()
        .uuid(),

      amountMinor:
        positiveAmountSchema,

      description:
        optionalTransactionTextSchema,

      note:
        optionalTransactionNoteSchema,

      occurredAt:
        occurredAtSchema,

      clientGeneratedId: z
        .string()
        .uuid()
        .optional(),
    })
    .openapi(
      "CreateIncome"
    );

export const createTransferSchema =
  z
    .object({
      fromAccountId:
        z.string().uuid(),

      toAccountId:
        z.string().uuid(),

      amountMinor:
        positiveAmountSchema,

      description:
        optionalTransactionTextSchema,

      note:
        optionalTransactionNoteSchema,

      occurredAt:
        occurredAtSchema,

      clientGeneratedId: z
        .string()
        .uuid()
        .optional(),
    })
    .refine(
      (value) =>
        value.fromAccountId !==
        value.toAccountId,
      {
        path: [
          "toAccountId",
        ],

        message:
          "Transfer accounts must be different",
      }
    )
    .openapi(
      "CreateTransfer"
    );

export const transactionHistoryQuerySchema =
  z
    .object({
      type: TransactionTypeSchema
        .optional()
        .openapi({
          param: {
            name: "type",
            in: "query",
          },
        }),

      accountId: z
        .string()
        .uuid()
        .optional()
        .openapi({
          param: {
            name: "accountId",
            in: "query",
          },
        }),

      categoryId: z
        .string()
        .uuid()
        .optional()
        .openapi({
          param: {
            name: "categoryId",
            in: "query",
          },
        }),

      dateFrom: z
        .string()
        .datetime({
          offset: true,
        })
        .optional()
        .openapi({
          param: {
            name: "dateFrom",
            in: "query",
          },
        }),

      dateTo: z
        .string()
        .datetime({
          offset: true,
        })
        .optional()
        .openapi({
          param: {
            name: "dateTo",
            in: "query",
          },
        }),

      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .openapi({
          param: {
            name: "limit",
            in: "query",
          },

          example: 20,
        }),

      cursor: z
        .string()
        .min(1)
        .optional()
        .openapi({
          param: {
            name: "cursor",
            in: "query",
          },
        }),
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
    )
    .openapi(
      "TransactionHistoryQuery"
    );

const createdTransactionBaseSchema =
  z.object({
    id: z.string().uuid(),

    amountMinor:
      z.string().openapi({
        example: "25000",
      }),

    currencyCode:
      z.string().length(3).openapi({
        example: "MGA",
      }),

    description:
      z.string().nullable(),

    note:
      z.string().nullable(),

    occurredAt:
      z.string().datetime(),

    clientGeneratedId:
      z.string().uuid(),

    createdAt:
      z.string().datetime(),
  });

export const ExpenseSchema =
  createdTransactionBaseSchema
    .extend({
      type: z.literal("EXPENSE"),

      accountId:
        z.string().uuid(),

      categoryId:
        z.string().uuid(),

      balanceAfterMinor:
        z.string(),
    })
    .openapi(
      "Expense"
    );

export const IncomeSchema =
  createdTransactionBaseSchema
    .extend({
      type: z.literal("INCOME"),

      accountId:
        z.string().uuid(),

      categoryId:
        z.string().uuid(),

      balanceAfterMinor:
        z.string(),
    })
    .openapi(
      "Income"
    );

export const TransferSchema =
  createdTransactionBaseSchema
    .extend({
      type: z.literal("TRANSFER"),

      fromAccountId:
        z.string().uuid(),

      toAccountId:
        z.string().uuid(),

      fromBalanceAfterMinor:
        z.string(),

      toBalanceAfterMinor:
        z.string(),
    })
    .openapi(
      "Transfer"
    );

const idempotencyMetaSchema =
  z.object({
    duplicated:
      z.boolean(),
  });

export const ExpenseResponseSchema =
  z
    .object({
      data:
        ExpenseSchema,

      meta:
        idempotencyMetaSchema,
    })
    .openapi(
      "ExpenseResponse"
    );

export const IncomeResponseSchema =
  z
    .object({
      data:
        IncomeSchema,

      meta:
        idempotencyMetaSchema,
    })
    .openapi(
      "IncomeResponse"
    );

export const TransferResponseSchema =
  z
    .object({
      data:
        TransferSchema,

      meta:
        idempotencyMetaSchema,
    })
    .openapi(
      "TransferResponse"
    );

export const TransactionHistoryEntrySchema =
  z
    .object({
      id: z.string().uuid(),

      account: z.object({
        id: z.string().uuid(),
        name: z.string(),
      }),

      amountMinor:
        z.string(),

      currencyCode:
        z.string().length(3),
    })
    .openapi(
      "TransactionHistoryEntry"
    );

export const TransactionHistoryAllocationSchema =
  z
    .object({
      id: z.string().uuid(),

      category: z.object({
        id: z.string().uuid(),
        name: z.string(),
        icon:
          z.string().nullable(),
        systemKey:
          z.string().nullable(),
      }),

      amountMinor:
        z.string(),
    })
    .openapi(
      "TransactionHistoryAllocation"
    );

export const TransactionHistoryItemSchema =
  z
    .object({
      id: z.string().uuid(),

      type:
        TransactionTypeSchema,

      status:
        TransactionStatusSchema,

      description:
        z.string().nullable(),

      note:
        z.string().nullable(),

      occurredAt:
        z.string().datetime(),

      clientGeneratedId:
        z.string().uuid(),

      entries:
        z.array(
          TransactionHistoryEntrySchema
        ),

      allocations:
        z.array(
          TransactionHistoryAllocationSchema
        ),

      createdAt:
        z.string().datetime(),
    })
    .openapi(
      "TransactionHistoryItem"
    );

export const TransactionsResponseSchema =
  z
    .object({
      data:
        z.array(
          TransactionHistoryItemSchema
        ),

      pagination: z.object({
        limit:
          z.number().int(),

        hasMore:
          z.boolean(),

        nextCursor:
          z.string().nullable(),
      }),
    })
    .openapi(
      "TransactionsResponse"
    );

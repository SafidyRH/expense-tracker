import { randomUUID } from "node:crypto";

import { Hono } from "hono";

import {
  zValidator,
} from "@hono/zod-validator";

import type {
  AuthEnv,
} from "../../../middleware/auth.middleware.js";

import {
  requireAuth,
} from "../../../middleware/auth.middleware.js";

import {
  CreateExpense,
} from "../application/create-expense.js";
import {
  CreateIncome,
} from "../application/create-income.js";
import {
  CreateTransfer,
} from "../application/create-transfer.js";

import {
  PrismaTransactionRepository,
} from "../infrastructure/prisma-transaction.repository.js";

import {
  createExpenseSchema,
  createIncomeSchema,
  createTransferSchema,
} from "./transaction.schemas.js";

import {
  toExpenseDto,
  toIncomeDto,
  toTransferDto,
} from "./transaction.mapper.js";

import {
  ListTransactions,
} from "../application/list-transactions.js";

import {
  decodeTransactionCursor,
  encodeTransactionCursor,
} from "../application/transaction-cursor.js";

import {
  transactionHistoryQuerySchema,
} from "./transaction.schemas.js";

import {
  toTransactionHistoryDto,
} from "./transaction.mapper.js";

const repository =
  new PrismaTransactionRepository();

const createExpense =
  new CreateExpense(repository);

const createIncome =
  new CreateIncome(repository);

const createTransfer =
  new CreateTransfer(repository);

  const listTransactions =
  new ListTransactions(
    repository
  );

export const transactionRoutes =
  new Hono<AuthEnv>();

transactionRoutes.use(
  "*",
  requireAuth
);

transactionRoutes.post(
  "/expenses",

  zValidator(
    "json",
    createExpenseSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const result =
      await createExpense.execute({
        userId:
          session!.user.id,

        accountId:
          input.accountId,

        categoryId:
          input.categoryId,

        amountMinor:
          BigInt(
            input.amountMinor
          ),

        description:
          input.description,

        note:
          input.note,

        occurredAt:
          input.occurredAt
            ? new Date(
                input.occurredAt
              )
            : new Date(),

        clientGeneratedId:
          input.clientGeneratedId ??
          randomUUID(),
      });

    if (!result.success) {
      if (
        result.error ===
        "ACCOUNT_NOT_FOUND"
      ) {
        return c.json(
          {
            error: {
              code:
                "ACCOUNT_NOT_FOUND",

              message:
                "Financial account not found",
            },
          },
          404
        );
      }

      if (
        result.error ===
        "CATEGORY_NOT_FOUND"
      ) {
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

      return c.json(
        {
          error: {
            code:
              "UNKNOWN_ERROR",
          },
        },
        500
      );
    }

    return c.json(
      {
        data:
          toExpenseDto(
            result.expense
          ),

        meta: {
          duplicated:
            result.duplicated,
        },
      },

      result.duplicated
        ? 200
        : 201
    );
  }
);

transactionRoutes.post(
  "/incomes",

  zValidator(
    "json",
    createIncomeSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const result =
      await createIncome.execute({
        userId:
          session!.user.id,

        accountId:
          input.accountId,

        categoryId:
          input.categoryId,

        amountMinor:
          BigInt(
            input.amountMinor
          ),

        description:
          input.description,

        note:
          input.note,

        occurredAt:
          input.occurredAt
            ? new Date(
                input.occurredAt
              )
            : new Date(),

        clientGeneratedId:
          input.clientGeneratedId ??
          randomUUID(),
      });

    if (!result.success) {
      if (
        result.error ===
        "ACCOUNT_NOT_FOUND"
      ) {
        return c.json(
          {
            error: {
              code:
                "ACCOUNT_NOT_FOUND",

              message:
                "Financial account not found",
            },
          },
          404
        );
      }

      if (
        result.error ===
        "CATEGORY_NOT_FOUND"
      ) {
        return c.json(
          {
            error: {
              code:
                "CATEGORY_NOT_FOUND",

              message:
                "Income category not found",
            },
          },
          404
        );
      }

      return c.json(
        {
          error: {
            code:
              "UNKNOWN_ERROR",
          },
        },
        500
      );
    }

    return c.json(
      {
        data:
          toIncomeDto(
            result.income
          ),

        meta: {
          duplicated:
            result.duplicated,
        },
      },

      result.duplicated
        ? 200
        : 201
    );
  }
);

transactionRoutes.post(
  "/transfers",

  zValidator(
    "json",
    createTransferSchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const result =
      await createTransfer.execute({
        userId:
          session!.user.id,

        fromAccountId:
          input.fromAccountId,

        toAccountId:
          input.toAccountId,

        amountMinor:
          BigInt(
            input.amountMinor
          ),

        description:
          input.description,

        note:
          input.note,

        occurredAt:
          input.occurredAt
            ? new Date(
                input.occurredAt
              )
            : new Date(),

        clientGeneratedId:
          input.clientGeneratedId ??
          randomUUID(),
      });

    if (!result.success) {
      if (
        result.error ===
        "ACCOUNT_NOT_FOUND"
      ) {
        return c.json(
          {
            error: {
              code:
                "ACCOUNT_NOT_FOUND",

              message:
                "Financial account not found",
            },
          },
          404
        );
      }

      if (
        result.error ===
        "SAME_ACCOUNT"
      ) {
        return c.json(
          {
            error: {
              code:
                "SAME_ACCOUNT",

              message:
                "Transfer accounts must be different",
            },
          },
          400
        );
      }

      if (
        result.error ===
        "CURRENCY_MISMATCH"
      ) {
        return c.json(
          {
            error: {
              code:
                "CURRENCY_MISMATCH",

              message:
                "Transfer accounts must use the same currency",
            },
          },
          400
        );
      }

      return c.json(
        {
          error: {
            code:
              "UNKNOWN_ERROR",
          },
        },
        500
      );
    }

    return c.json(
      {
        data:
          toTransferDto(
            result.transfer
          ),

        meta: {
          duplicated:
            result.duplicated,
        },
      },

      result.duplicated
        ? 200
        : 201
    );
  }
);

transactionRoutes.get(
  "/",

  zValidator(
    "query",
    transactionHistoryQuerySchema
  ),

  async (c) => {
    const session =
      c.get("session");

    const query =
      c.req.valid("query");

    let cursor;

    if (query.cursor) {
      cursor =
        decodeTransactionCursor(
          query.cursor
        );

      if (!cursor) {
        return c.json(
          {
            error: {
              code:
                "INVALID_CURSOR",

              message:
                "Invalid transaction cursor",
            },
          },
          400
        );
      }
    }

    const result =
      await listTransactions.execute({
        userId:
          session!.user.id,

        type:
          query.type,

        accountId:
          query.accountId,

        categoryId:
          query.categoryId,

        dateFrom:
          query.dateFrom
            ? new Date(
                query.dateFrom
              )
            : undefined,

        dateTo:
          query.dateTo
            ? new Date(
                query.dateTo
              )
            : undefined,

        limit:
          query.limit,

        cursor:
          cursor ?? undefined,
      });

    const lastItem =
      result.items.at(-1);

    const nextCursor =
      result.hasMore &&
      lastItem
        ? encodeTransactionCursor({
            id: lastItem.id,

            occurredAt:
              lastItem.occurredAt,
          })
        : null;

    return c.json({
      data:
        result.items.map(
          toTransactionHistoryDto
        ),

      pagination: {
        limit:
          query.limit,

        hasMore:
          result.hasMore,

        nextCursor,
      },
    });
  }
);


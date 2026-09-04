import { randomUUID } from "node:crypto";

import {
  requireAuth,
} from "../../../middleware/auth.middleware.js";

import {
  createOpenApiHono,
} from "../../../openapi/hono.js";

import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../../shared/errors/index.js";

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
  toTransactionHistoryDto,
} from "./transaction.mapper.js";

import {
  createExpenseRoute,
  createIncomeRoute,
  createTransferRoute,
  listTransactionsRoute,
} from "./transaction.openapi.js";

import type {
  CreateExpenseError,
} from "../domain/expense.js";

import type {
  CreateIncomeError,
} from "../domain/income.js";

import type {
  CreateTransferError,
} from "../domain/transfer.js";

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
  createOpenApiHono();

transactionRoutes.use(
  "*",
  requireAuth
);

transactionRoutes.openapi(
  createExpenseRoute,
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
      throwCreateExpenseError(
        result.error
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

transactionRoutes.openapi(
  createIncomeRoute,
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
      throwCreateIncomeError(
        result.error
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

transactionRoutes.openapi(
  createTransferRoute,
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
      throwCreateTransferError(
        result.error
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

transactionRoutes.openapi(
  listTransactionsRoute,
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
        throw new BadRequestError(
          "Invalid transaction cursor",
          "INVALID_CURSOR"
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
    }, 200);
  }
);

function throwCreateExpenseError(
  error: CreateExpenseError
): never {
  switch (error) {
    case "ACCOUNT_NOT_FOUND":
      throw new NotFoundError(
        "Financial account not found",
        "ACCOUNT_NOT_FOUND"
      );

    case "CATEGORY_NOT_FOUND":
      throw new NotFoundError(
        "Expense category not found",
        "CATEGORY_NOT_FOUND"
      );

    default:
      throwUnexpectedTransactionError(
        error
      );
  }
}

function throwCreateIncomeError(
  error: CreateIncomeError
): never {
  switch (error) {
    case "ACCOUNT_NOT_FOUND":
      throw new NotFoundError(
        "Financial account not found",
        "ACCOUNT_NOT_FOUND"
      );

    case "CATEGORY_NOT_FOUND":
      throw new NotFoundError(
        "Income category not found",
        "CATEGORY_NOT_FOUND"
      );

    default:
      throwUnexpectedTransactionError(
        error
      );
  }
}

function throwCreateTransferError(
  error: CreateTransferError
): never {
  switch (error) {
    case "ACCOUNT_NOT_FOUND":
      throw new NotFoundError(
        "Financial account not found",
        "ACCOUNT_NOT_FOUND"
      );

    case "SAME_ACCOUNT":
      throw new BadRequestError(
        "Transfer accounts must be different",
        "SAME_ACCOUNT"
      );

    case "CURRENCY_MISMATCH":
      throw new BadRequestError(
        "Transfer accounts must use the same currency",
        "CURRENCY_MISMATCH"
      );

    default:
      throwUnexpectedTransactionError(
        error
      );
  }
}

function throwUnexpectedTransactionError(
  error: string
): never {
  console.error(
    "Unexpected transaction error:",
    error
  );

  throw new InternalServerError();
}

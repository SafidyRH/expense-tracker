import {
  createRoute,
} from "@hono/zod-openapi";

import {
  notFoundResponse,
  rateLimitedResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "../../../openapi/responses.js";

import {
  ExpenseResponseSchema,
  IncomeResponseSchema,
  TransactionsResponseSchema,
  TransferResponseSchema,
  createExpenseSchema,
  createIncomeSchema,
  createTransferSchema,
  transactionHistoryQuerySchema,
} from "./transaction.schemas.js";

const transactionSecurity = [
  {
    sessionCookie: [],
  },
];

export const listTransactionsRoute =
  createRoute({
    method: "get",
    path: "/",
    tags: [
      "Transactions",
    ],
    summary:
      "List transactions",
    description:
      "Returns a cursor-paginated transaction history for the authenticated user.",
    security:
      transactionSecurity,
    request: {
      query:
        transactionHistoryQuerySchema,
    },
    responses: {
      200: {
        description:
          "Transactions",
        content: {
          "application/json": {
            schema:
              TransactionsResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      429:
        rateLimitedResponse,
    },
  });

export const createExpenseRoute =
  createRoute({
    method: "post",
    path: "/expenses",
    tags: [
      "Transactions",
    ],
    summary:
      "Create an expense",
    security:
      transactionSecurity,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              createExpenseSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description:
          "Expense created",
        content: {
          "application/json": {
            schema:
              ExpenseResponseSchema,
          },
        },
      },
      200: {
        description:
          "Duplicate expense request returned idempotently",
        content: {
          "application/json": {
            schema:
              ExpenseResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      404:
        notFoundResponse,
      429:
        rateLimitedResponse,
    },
  });

export const createIncomeRoute =
  createRoute({
    method: "post",
    path: "/incomes",
    tags: [
      "Transactions",
    ],
    summary:
      "Create an income",
    security:
      transactionSecurity,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              createIncomeSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description:
          "Income created",
        content: {
          "application/json": {
            schema:
              IncomeResponseSchema,
          },
        },
      },
      200: {
        description:
          "Duplicate income request returned idempotently",
        content: {
          "application/json": {
            schema:
              IncomeResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      404:
        notFoundResponse,
      429:
        rateLimitedResponse,
    },
  });

export const createTransferRoute =
  createRoute({
    method: "post",
    path: "/transfers",
    tags: [
      "Transactions",
    ],
    summary:
      "Create a transfer",
    security:
      transactionSecurity,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              createTransferSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description:
          "Transfer created",
        content: {
          "application/json": {
            schema:
              TransferResponseSchema,
          },
        },
      },
      200: {
        description:
          "Duplicate transfer request returned idempotently",
        content: {
          "application/json": {
            schema:
              TransferResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      404:
        notFoundResponse,
      429:
        rateLimitedResponse,
    },
  });

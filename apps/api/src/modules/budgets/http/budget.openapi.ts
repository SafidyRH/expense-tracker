import {
  createRoute,
} from "@hono/zod-openapi";

import {
  conflictResponse,
  notFoundResponse,
  rateLimitedResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "../../../openapi/responses.js";

import {
  BudgetOverviewResponseSchema,
  BudgetRecordResponseSchema,
  CategoryBudgetRecordResponseSchema,
  budgetCategoryParamSchema,
  budgetMonthSchema,
  upsertBudgetSchema,
} from "./budget.schemas.js";

const budgetSecurity = [
  {
    sessionCookie: [],
  },
];

export const getBudgetOverviewRoute =
  createRoute({
    method: "get",
    path: "/",
    tags: [
      "Budgets",
    ],
    summary:
      "Get a monthly budget overview",
    "x-ownership": "user-month-scope",
    security:
      budgetSecurity,
    request: {
      query:
        budgetMonthSchema,
    },
    responses: {
      200: {
        description:
          "Monthly budget overview",
        content: {
          "application/json": {
            schema:
              BudgetOverviewResponseSchema,
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

export const upsertGlobalBudgetRoute =
  createRoute({
    method: "put",
    path: "/global",
    tags: [
      "Budgets",
    ],
    summary:
      "Create or update the monthly global budget",
    "x-ownership": "upserted-for-authenticated-user",
    security:
      budgetSecurity,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              upsertBudgetSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Global budget upserted",
        content: {
          "application/json": {
            schema:
              BudgetRecordResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      409:
        conflictResponse,
      429:
        rateLimitedResponse,
    },
  });

export const upsertCategoryBudgetRoute =
  createRoute({
    method: "put",
    path: "/categories/{categoryId}",
    tags: [
      "Budgets",
    ],
    summary:
      "Create or update a monthly category budget",
    description:
      "Allocates part of the monthly global budget to an expense category.",
    "x-ownership": "category-id-must-belong-to-user-or-system",
    security:
      budgetSecurity,
    request: {
      params:
        budgetCategoryParamSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              upsertBudgetSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Category budget upserted",
        content: {
          "application/json": {
            schema:
              CategoryBudgetRecordResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      404:
        notFoundResponse,
      409:
        conflictResponse,
      429:
        rateLimitedResponse,
    },
  });

export const deleteCategoryBudgetRoute =
  createRoute({
    method: "delete",
    path: "/categories/{categoryId}",
    tags: [
      "Budgets",
    ],
    summary:
      "Delete a monthly category budget",
    "x-ownership": "category-id-scoped-to-authenticated-user",
    security:
      budgetSecurity,
    request: {
      params:
        budgetCategoryParamSchema,
      query:
        budgetMonthSchema,
    },
    responses: {
      204: {
        description:
          "Category budget deleted",
      },
      400:
        validationErrorResponse,
      401:
        unauthorizedResponse,
      429:
        rateLimitedResponse,
    },
  });

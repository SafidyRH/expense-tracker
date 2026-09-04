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
  accountIdSchema,
  createFinancialAccountSchema,
  FinancialAccountResponseSchema,
  FinancialAccountsResponseSchema,
  updateFinancialAccountSchema,
} from "./account.schemas.js";

export const listAccountsRoute =
  createRoute({
    method: "get",

    path: "/",

    tags: [
      "Accounts",
    ],

    summary:
      "List financial accounts",

    description:
      "Returns the authenticated user's active financial accounts.",

    security: [
      {
        sessionCookie:
          [],
      },
    ],

    responses: {
      200: {
        description:
          "Financial accounts",

        content: {
          "application/json": {
            schema:
              FinancialAccountsResponseSchema,
          },
        },
      },

      401:
        unauthorizedResponse,

      429:
        rateLimitedResponse,
    },
  });

  export const createAccountRoute =
  createRoute({
    method: "post",

    path: "/",

    tags: [
      "Accounts",
    ],

    summary:
      "Create a financial account",

    security: [
      {
        sessionCookie:
          [],
      },
    ],

    request: {
      body: {
        required: true,

        content: {
          "application/json": {
              schema:
              createFinancialAccountSchema,
          },
        },
      },
    },

    responses: {
      201: {
        description:
          "Account created",

        content: {
          "application/json": {
            schema:
              FinancialAccountResponseSchema,
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

  export const getAccountRoute =
  createRoute({
    method: "get",

    path: "/{id}",

    tags: [
      "Accounts",
    ],

    summary:
      "Get a financial account",

    security: [
      {
        sessionCookie:
          [],
      },
    ],

    request: {
      params:
        accountIdSchema,
    },

    responses: {
      200: {
        description:
          "Financial account",

        content: {
          "application/json": {
            schema:
              FinancialAccountResponseSchema,
          },
        },
      },

      401:
        unauthorizedResponse,

      400:
        validationErrorResponse,

      404:
        notFoundResponse,

      429:
        rateLimitedResponse,
    },
  });

  export const updateAccountRoute =
  createRoute({
    method: "patch",

    path: "/{id}",

    tags: [
      "Accounts",
    ],

    summary:
      "Update a financial account",

    security: [
      {
        sessionCookie:
          [],
      },
    ],

    request: {
      params:
        accountIdSchema,

      body: {
        required: true,

        content: {
          "application/json": {
              schema:
              updateFinancialAccountSchema,
          },
        },
      },
    },

    responses: {
      200: {
        description:
          "Account updated",

        content: {
          "application/json": {
            schema:
              FinancialAccountResponseSchema,
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

  export const archiveAccountRoute =
  createRoute({
    method: "delete",

    path: "/{id}",

    tags: [
      "Accounts",
    ],

    summary:
      "Archive a financial account",

    description:
      "Soft archives an account. The account is not physically deleted.",

    security: [
      {
        sessionCookie:
          [],
      },
    ],

    request: {
      params:
        accountIdSchema,
    },

    responses: {
      204: {
        description:
          "Account archived",
      },

      401:
        unauthorizedResponse,

      400:
        validationErrorResponse,

      404:
        notFoundResponse,

      429:
        rateLimitedResponse,
    },
  });

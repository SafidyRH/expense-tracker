import { ErrorSchema } from "./common.schemas.js";

export const unauthorizedResponse = {
  description:
    "Authentication required",

  content: {
    "application/json": {
      schema:
        ErrorSchema,
    },
  },
} as const;

export const validationErrorResponse = {
  description:
    "Invalid request",

  content: {
    "application/json": {
      schema:
        ErrorSchema,
    },
  },
} as const;

export const notFoundResponse = {
  description:
    "Resource not found",

  content: {
    "application/json": {
      schema:
        ErrorSchema,
    },
  },
} as const;

export const conflictResponse = {
  description:
    "Conflict",

  content: {
    "application/json": {
      schema:
        ErrorSchema,
    },
  },
} as const;

export const rateLimitedResponse = {
  description:
    "Too many requests",

  content: {
    "application/json": {
      schema:
        ErrorSchema,
    },
  },
} as const;
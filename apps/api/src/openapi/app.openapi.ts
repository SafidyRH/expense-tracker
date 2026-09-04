import {
  createRoute,
  z,
} from "@hono/zod-openapi";

import {
  rateLimitedResponse,
  unauthorizedResponse,
} from "./responses.js";

export const ApiStatusSchema =
  z
    .object({
      name:
        z.string().openapi({
          example:
            "Expense Tracker API",
        }),

      status:
        z.string().openapi({
          example: "running",
        }),
    })
    .openapi(
      "ApiStatus"
    );

export const HealthSchema =
  z
    .object({
      status:
        z.enum([
          "ok",
          "error",
        ]),

      services: z.object({
        api: z.enum([
          "up",
        ]),

        database: z.enum([
          "up",
          "down",
        ]),
      }),

      databaseLatencyMs:
        z.number().int().optional(),

      timestamp:
        z.string().datetime(),
    })
    .openapi(
      "Health"
    );

export const CurrentUserSchema =
  z
    .object({
      id: z.string().uuid(),

      name:
        z.string(),

      email:
        z.string().email(),

      emailVerified:
        z.boolean(),

      image:
        z.string().nullable().optional(),

      defaultCurrency:
        z
          .string()
          .length(3)
          .nullable()
          .optional(),

      timezone:
        z
          .string()
          .nullable()
          .optional(),

      createdAt:
        z.union([
          z.string().datetime(),
          z.date(),
        ]).optional(),

      updatedAt:
        z.union([
          z.string().datetime(),
          z.date(),
        ]).optional(),
    })
    .openapi(
      "CurrentUser"
    );

export const CurrentUserResponseSchema =
  z
    .object({
      user:
        CurrentUserSchema,
    })
    .openapi(
      "CurrentUserResponse"
    );

export const apiStatusRoute =
  createRoute({
    method: "get",
    path: "/",
    tags: [
      "System",
    ],
    summary:
      "Get API status",
    "x-public": true,
    responses: {
      200: {
        description:
          "API status",
        content: {
          "application/json": {
            schema:
              ApiStatusSchema,
          },
        },
      },
      429:
        rateLimitedResponse,
    },
  });

export const healthRoute =
  createRoute({
    method: "get",
    path: "/health",
    tags: [
      "System",
    ],
    summary:
      "Check API and database health",
    "x-public": true,
    responses: {
      200: {
        description:
          "API and database are healthy",
        content: {
          "application/json": {
            schema:
              HealthSchema,
          },
        },
      },
      503: {
        description:
          "Database health check failed",
        content: {
          "application/json": {
            schema:
              HealthSchema,
          },
        },
      },
    },
  });

export const meRoute =
  createRoute({
    method: "get",
    path: "/me",
    tags: [
      "Auth",
    ],
    summary:
      "Get the authenticated user",
    "x-ownership": "self",
    security: [
      {
        sessionCookie: [],
      },
    ],
    responses: {
      200: {
        description:
          "Current user",
        content: {
          "application/json": {
            schema:
              CurrentUserResponseSchema,
          },
        },
      },
      401:
        unauthorizedResponse,
      429:
        rateLimitedResponse,
    },
  });

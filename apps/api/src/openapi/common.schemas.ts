import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({
        example: "ACCOUNT_NOT_FOUND",
      }),

      message: z.string().openapi({
        example:
          "Financial account not found",
      }),

      details: z
        .unknown()
        .optional(),
    }),
  })
  .openapi("ErrorResponse");

export const IdParamSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      param: {
        name: "id",
        in: "path",
      },

      example:
        "550e8400-e29b-41d4-a716-446655440000",
    }),
});


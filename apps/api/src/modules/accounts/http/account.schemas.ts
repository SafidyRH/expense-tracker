import {
  z,
} from "@hono/zod-openapi";

import {
  financialAccountTypes,
} from "../domain/financial-account.js";

export const FinancialAccountTypeSchema =
  z.enum(
    financialAccountTypes
  ).openapi(
    "FinancialAccountType"
  );

export const FinancialAccountSchema =
  z
    .object({
      id: z
        .string()
        .uuid()
        .openapi({
          example:
            "550e8400-e29b-41d4-a716-446655440000",
        }),

      name:
        z.string().openapi({
          example: "MVola",
        }),

      type:
        FinancialAccountTypeSchema,

      institutionName:
        z
          .string()
          .nullable()
          .openapi({
            example: "Telma",
          }),

      currencyCode:
        z
          .string()
          .length(3)
          .openapi({
            example: "MGA",
          }),

      initialBalanceMinor:
        z.string().openapi({
          example: "350000",
        }),

      balanceMinor:
        z.string().openapi({
          example: "325000",
        }),

      isArchived:
        z.boolean(),

      createdAt:
        z
          .string()
          .datetime()
          .openapi({
            example:
              "2026-01-15T10:00:00.000Z",
          }),

      updatedAt:
        z
          .string()
          .datetime()
          .openapi({
            example:
              "2026-01-15T10:00:00.000Z",
          }),
    })
    .openapi(
      "FinancialAccount"
    );

export const FinancialAccountResponseSchema =
  z
    .object({
      data:
        FinancialAccountSchema,
    })
    .openapi(
      "FinancialAccountResponse"
    );

export const FinancialAccountsResponseSchema =
  z
    .object({
      data:
        z.array(
          FinancialAccountSchema
        ),
    })
    .openapi(
      "FinancialAccountsResponse"
    );

const amountSchema = z
  .string()
  .regex(
    /^-?\d+$/,
    "Amount must be an integer represented as a string"
  )
  .openapi({
    example: "350000",
  });

const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) =>
    value.toUpperCase()
  )
  .openapi({
    example: "MGA",
  });

export const createFinancialAccountSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .openapi({
          example: "MVola",
        }),

      type:
        FinancialAccountTypeSchema,

      institutionName: z
        .string()
        .trim()
        .max(150)
        .nullable()
        .optional()
        .openapi({
          example: "Telma",
        }),

      currencyCode:
        currencySchema.default("MGA"),

      initialBalanceMinor:
        amountSchema.default("0"),
    })
    .openapi(
      "CreateFinancialAccount"
    );

export const updateFinancialAccountSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional()
        .openapi({
          example: "Main bank",
        }),

      type:
        FinancialAccountTypeSchema
          .optional(),

      institutionName: z
        .string()
        .trim()
        .max(150)
        .nullable()
        .optional()
        .openapi({
          example:
            "Bank of Madagascar",
        }),
    })
    .refine(
      (value) =>
        Object.keys(value).length > 0,
      {
        message:
          "At least one field is required",
      }
    )
    .openapi(
      "UpdateFinancialAccount"
    );

export const accountIdSchema =
  z
    .object({
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
    })
    .openapi(
      "AccountIdParam"
    );

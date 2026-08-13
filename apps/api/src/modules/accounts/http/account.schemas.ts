import { z } from "zod";

import {
  financialAccountTypes,
} from "../domain/financial-account.js";

const amountSchema = z
  .string()
  .regex(
    /^-?\d+$/,
    "Amount must be an integer represented as a string"
  );

const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) =>
    value.toUpperCase()
  );

export const createFinancialAccountSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100),

    type: z.enum(
      financialAccountTypes
    ),

    institutionName: z
      .string()
      .trim()
      .max(150)
      .nullable()
      .optional(),

    currencyCode:
      currencySchema.default("MGA"),

    initialBalanceMinor:
      amountSchema.default("0"),
  });

export const updateFinancialAccountSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

      type: z
        .enum(financialAccountTypes)
        .optional(),

      institutionName: z
        .string()
        .trim()
        .max(150)
        .nullable()
        .optional(),
    })
    .refine(
      (value) =>
        Object.keys(value).length > 0,
      {
        message:
          "At least one field is required",
      }
    );

export const accountIdSchema =
  z.object({
    id: z.string().uuid(),
  });
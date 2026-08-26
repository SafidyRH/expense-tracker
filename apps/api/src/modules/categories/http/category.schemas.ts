import { z } from "zod";

import {
  categoryTypes,
} from "../domain/category.js";

export const createCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100),

    type: z.enum(categoryTypes),

    icon: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .optional(),
  });

export const updateCategorySchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

      icon: z
        .string()
        .trim()
        .max(100)
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

export const categoryFilterSchema =
  z.object({
    type: z
      .enum(categoryTypes)
      .optional(),
  });

export const categoryIdSchema =
  z.object({
    id: z.string().uuid(),
  });
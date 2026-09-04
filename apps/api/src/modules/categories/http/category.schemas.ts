import {
  z,
} from "@hono/zod-openapi";

import {
  categoryTypes,
} from "../domain/category.js";

export const CategoryTypeSchema =
  z.enum(
    categoryTypes
  ).openapi(
    "CategoryType"
  );

export const CategorySchema =
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
          example: "Groceries",
        }),

      type:
        CategoryTypeSchema,

      icon:
        z
          .string()
          .nullable()
          .openapi({
            example: "shopping-cart",
          }),

      systemKey:
        z
          .string()
          .nullable()
          .openapi({
            example: "food",
          }),

      parentId:
        z
          .string()
          .uuid()
          .nullable(),

      isSystem:
        z.boolean(),

      sortOrder:
        z.number().int(),
    })
    .openapi(
      "Category"
    );

export const CategoryResponseSchema =
  z
    .object({
      data:
        CategorySchema,
    })
    .openapi(
      "CategoryResponse"
    );

export const CategoriesResponseSchema =
  z
    .object({
      data:
        z.array(
          CategorySchema
        ),
    })
    .openapi(
      "CategoriesResponse"
    );

export const createCategorySchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .openapi({
          example: "Groceries",
        }),

      type:
        CategoryTypeSchema,

      icon: z
        .string()
        .trim()
        .max(100)
        .nullable()
        .optional()
        .openapi({
          example: "shopping-cart",
        }),
    })
    .openapi(
      "CreateCategory"
    );

export const updateCategorySchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional()
        .openapi({
          example: "Weekly groceries",
        }),

      icon: z
        .string()
        .trim()
        .max(100)
        .nullable()
        .optional()
        .openapi({
          example: "basket",
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
      "UpdateCategory"
    );

export const categoryFilterSchema =
  z
    .object({
      type: CategoryTypeSchema
        .optional()
        .openapi({
          param: {
            name: "type",
            in: "query",
          },
        }),
    })
    .openapi(
      "CategoryFilter"
    );

export const categoryIdSchema =
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
      "CategoryIdParam"
    );

import { Hono } from "hono";

import {
  zValidator,
} from "@hono/zod-validator";

import type {
  AuthEnv,
} from "../../../middleware/auth.middleware.js";

import {
  requireAuth,
} from "../../../middleware/auth.middleware.js";

import {
  NotFoundError,
} from "../../../shared/errors/index.js";

import {
  throwOnValidationError,
} from "../../../shared/validation/zod-validator.js";

import {
  PrismaCategoryRepository,
} from "../infrastructure/prisma-category.repository.js";

import {
  CreateCategory,
} from "../application/create-category.js";

import {
  ListCategories,
} from "../application/list-category.js";

import {
  UpdateCategory,
} from "../application/update-category.js";

import {
  ArchiveCategory,
} from "../application/archive-category.js";

import {
  categoryFilterSchema,
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schemas.js";

import {
  toCategoryDto,
} from "./category.mapper.js";

const repository =
  new PrismaCategoryRepository();

const createCategory =
  new CreateCategory(repository);

const listCategories =
  new ListCategories(repository);

const updateCategory =
  new UpdateCategory(repository);

const archiveCategory =
  new ArchiveCategory(repository);

export const categoryRoutes =
  new Hono<AuthEnv>();

categoryRoutes.use("*", requireAuth);


categoryRoutes.get(
  "/",

  zValidator(
    "query",
    categoryFilterSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const { type } =
      c.req.valid("query");

    const categories =
      await listCategories.execute(
        session!.user.id,
        type
      );

    return c.json({
      data: categories.map(
        toCategoryDto
      ),
    });
  }
);

categoryRoutes.post(
  "/",

  zValidator(
    "json",
    createCategorySchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const category =
      await createCategory.execute({
        userId: session!.user.id,

        name: input.name,

        type: input.type,

        icon: input.icon,
      });

    return c.json(
      {
        data:
          toCategoryDto(category),
      },
      201
    );
  }
);

categoryRoutes.patch(
  "/:id",

  zValidator(
    "param",
    categoryIdSchema,
    throwOnValidationError
  ),

  zValidator(
    "json",
    updateCategorySchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const { id } =
      c.req.valid("param");

    const input =
      c.req.valid("json");

    const category =
      await updateCategory.execute(
        id,
        session!.user.id,
        input
      );

    if (!category) {
      throw new NotFoundError(
        "Category not found or cannot be modified",
        "CATEGORY_NOT_FOUND"
      );
    }

    return c.json({
      data:
        toCategoryDto(category),
    });
  }
);

categoryRoutes.delete(
  "/:id",

  zValidator(
    "param",
    categoryIdSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const { id } =
      c.req.valid("param");

    const archived =
      await archiveCategory.execute(
        id,
        session!.user.id
      );

    if (!archived) {
      throw new NotFoundError(
        "Category not found or cannot be archived",
        "CATEGORY_NOT_FOUND"
      );
    }

    return c.body(null, 204);
  }
);


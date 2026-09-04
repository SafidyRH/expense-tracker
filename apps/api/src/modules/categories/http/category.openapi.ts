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
  CategoriesResponseSchema,
  CategoryResponseSchema,
  categoryFilterSchema,
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schemas.js";

const categorySecurity = [
  {
    sessionCookie: [],
  },
];

export const listCategoriesRoute =
  createRoute({
    method: "get",
    path: "/",
    tags: [
      "Categories",
    ],
    summary:
      "List categories",
    description:
      "Returns system categories and the authenticated user's custom categories. Can be filtered by type.",
    security:
      categorySecurity,
    request: {
      query:
        categoryFilterSchema,
    },
    responses: {
      200: {
        description:
          "Categories",
        content: {
          "application/json": {
            schema:
              CategoriesResponseSchema,
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

export const createCategoryRoute =
  createRoute({
    method: "post",
    path: "/",
    tags: [
      "Categories",
    ],
    summary:
      "Create a category",
    security:
      categorySecurity,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              createCategorySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description:
          "Category created",
        content: {
          "application/json": {
            schema:
              CategoryResponseSchema,
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

export const updateCategoryRoute =
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: [
      "Categories",
    ],
    summary:
      "Update a category",
    description:
      "Updates one of the authenticated user's custom categories. System categories cannot be modified.",
    security:
      categorySecurity,
    request: {
      params:
        categoryIdSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              updateCategorySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Category updated",
        content: {
          "application/json": {
            schema:
              CategoryResponseSchema,
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

export const archiveCategoryRoute =
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: [
      "Categories",
    ],
    summary:
      "Archive a category",
    description:
      "Soft archives one of the authenticated user's custom categories. System categories cannot be archived.",
    security:
      categorySecurity,
    request: {
      params:
        categoryIdSchema,
    },
    responses: {
      204: {
        description:
          "Category archived",
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

import { Hono } from "hono";

import {
  errorHandler,
} from "../shared/errors/error-handler.js";
import type {
  AppEnv,
} from "../types/app-env.js";

import {
  accountRoutes,
} from "../modules/accounts/index.js";
import {
  budgetRoutes,
} from "../modules/budgets/index.js";
import {
  categoryRoutes,
} from "../modules/categories/index.js";
import {
  transactionRoutes,
} from "../modules/transactions/index.js";

export function createIntegrationApp() {
  const app =
    new Hono<AppEnv>();

  app.onError(
    errorHandler
  );

  app.route(
    "/api/accounts",
    accountRoutes
  );
  app.route(
    "/api/categories",
    categoryRoutes
  );
  app.route(
    "/api/budgets",
    budgetRoutes
  );
  app.route(
    "/api/transactions",
    transactionRoutes
  );

  return app;
}

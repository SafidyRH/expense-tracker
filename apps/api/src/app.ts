import {
  swaggerUI,
} from "@hono/swagger-ui";
import { cors } from "hono/cors";

import { prisma } from "@expense-tracker/database";
import { auth } from "./lib/auth.js";

import {requireAuth} from "./middleware/auth.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";
import {
  securityHeaders,
} from "./middleware/security.middleware.js";
import {
  apiBodyLimit,
} from "./middleware/body-limit.middleware.js";
import {
  apiRateLimit,
} from "./middleware/rate-limit.middleware.js";
import {
  apiTimeout,
} from "./middleware/timeout.middleware.js";
import {
  requireJsonContentType,
} from "./middleware/content-type.middleware.js";
import {
  apiMethodGuard,
} from "./middleware/method-guard.middleware.js";


import {
  accountRoutes,
} from "./modules/accounts/index.js";
import {
  categoryRoutes,
} from "./modules/categories/index.js";
import {
  budgetRoutes,
} from "./modules/budgets/index.js";
import {
  transactionRoutes,
} from "./modules/transactions/index.js";

import {
  errorHandler,
} from "./shared/errors/error-handler.js";
import {
  apiErrorBody,
} from "./shared/http/api-response.js";
import type { AppEnv } from "./types/app-env.js";

import {
  corsConfig,
} from "./config/cors.js";

import {
  apiStatusRoute,
  healthRoute,
  meRoute,
} from "./openapi/app.openapi.js";
import {
  createOpenApiHono,
} from "./openapi/hono.js";


const app =
  createOpenApiHono();

app.onError(
  errorHandler
);

app.use(
  "*",
  requestLoggerMiddleware
);

app.use(
  "*",
  securityHeaders
);

app.use(
  "/api/*",
  cors(corsConfig)
);

app.use(
  "/api/*",
  apiBodyLimit
);

app.use(
  "/api/*",
  apiRateLimit
);

app.use(
  "/api/*",
  apiTimeout
);

app.use(
  "/api/*",
  apiMethodGuard
);

app.use(
  "/api/*",
  requireJsonContentType
);



app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.openapi(apiStatusRoute, (c) => {
  return c.json({
    name: "Expense Tracker API",
    status: "running",
  }, 200);
});

app.openapi(healthRoute, async (c) => {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    const latencyMs = Math.round(performance.now() - startedAt);

    return c.json({
      status: "ok",
      services: {
        api: "up",
        database: "up",
      },
      databaseLatencyMs: latencyMs,
      timestamp: new Date().toISOString(),
    }, 200);
  } catch (error) {
    console.error("Health check failed:", error);

    return c.json(
      {
        status: "error",
        services: {
          api: "up",
          database: "down",
        },
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

app.use(
  "/me",
  requireAuth
);

app.openapi(meRoute, (c) => {
  const session = c.get("session");

  return c.json({
    user: session!.user,
  }, 200);
});

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

app.openAPIRegistry.registerComponent(
  "securitySchemes",
  "sessionCookie",
  {
    type: "apiKey",
    in: "cookie",
    name:
      "better-auth.session_token",
    description:
      "Better Auth session cookie.",
  }
);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Expense Tracker API",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3030",
      description:
        "Local development",
    },
  ],
});

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  })
);

app.notFound((c) => {
  return c.json(
    apiErrorBody({
      code:
        "NOT_FOUND",
      message:
        "Route not found",
    }),
    404
  );
});

export default app;

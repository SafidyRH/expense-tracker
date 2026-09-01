import { Hono } from "hono";
import { cors } from "hono/cors";

import { prisma } from "@expense-tracker/database";
import { auth } from "./lib/auth.js";

import {requireAuth} from "./middleware/auth.middleware.js";

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
} from "./middleware/error-handler.js";


const app = new Hono();

app.onError(errorHandler);

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/", (c) => {
  return c.json({
    name: "Expense Tracker API",
    status: "running",
  });
});

app.get("/health", async (c) => {
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
    });
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

app.get("/me", requireAuth, (c) => {
  const session = c.get("session");

  return c.json({
    user: session!.user,
  });
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

app.notFound((c) => {
  return c.json(
    {
      error: {
        code:
          "NOT_FOUND",

        message:
          "Route not found",
      },
    },
    404
  );
});

export default app;

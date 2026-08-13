import { Hono } from "hono";
import { cors } from "hono/cors";

import { prisma } from "@expense-tracker/database";
import { auth } from "./lib/auth.js";

import {requireAuth} from "./middleware/auth.middleware.js";

const app = new Hono();

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

export default app;
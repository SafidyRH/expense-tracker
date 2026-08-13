import { Hono } from "hono";
import { cors } from "hono/cors";

import { prisma } from "@expense-tracker/database";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

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

export default app;
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

import { vi } from "vitest";

const envTestPath = resolve(
  process.cwd(),
  ".env.test"
);

if (existsSync(envTestPath)) {
  loadEnvFile(envTestPath);
}

setDefaultEnv("NODE_ENV", "test");
setDefaultEnv(
  "DATABASE_URL",
  process.env.TEST_DATABASE_URL ??
    "postgresql://expense_test_user:expense_test_password@localhost:5433/expense_tracker_test?schema=public"
);
setDefaultEnv(
  "BETTER_AUTH_URL",
  "http://localhost:3030"
);
setDefaultEnv(
  "BETTER_AUTH_SECRET",
  "expense-tracker-test-secret"
);
setDefaultEnv(
  "FRONTEND_URL",
  "http://localhost:3000"
);

function setDefaultEnv(
  name: string,
  value: string
) {
  if (!process.env[name]) {
    process.env[name] = value;
  }
}

type TestContext = {
  req: {
    header(name: string): string | undefined;
  };
  set(key: string, value: unknown): void;
  json(body: unknown, status?: number): Response | Promise<Response>;
};

type Next = () => Promise<void>;

vi.mock("../middleware/auth.middleware.js", () => ({
  requireAuth: async (
    c: TestContext,
    next: Next
  ) => {
    const userId =
      c.req.header("x-test-user-id");

    if (!userId) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          },
        },
        401
      );
    }

    c.set("session", {
      user: {
        id: userId,
        name: "Test User",
        email: `${userId}@test.local`,
        emailVerified: true,
        image: null,
        defaultCurrency: "MGA",
        timezone: "Indian/Antananarivo",
      },
      session: {
        id: "test-session",
        userId,
        token: "test-token",
        expiresAt: new Date(
          "2099-01-01T00:00:00.000Z"
        ),
      },
    });

    await next();
  },
}));

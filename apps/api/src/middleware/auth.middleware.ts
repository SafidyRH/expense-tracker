import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { auth } from "../lib/auth.js";

export type AuthEnv = {
  Variables: {
    session: typeof auth.$Infer.Session | null;
  };
};

export const requireAuth = createMiddleware<AuthEnv>(
  async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    c.set("session", session);

    await next();
  }
);
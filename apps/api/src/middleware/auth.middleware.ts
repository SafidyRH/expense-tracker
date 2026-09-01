import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth.js";
import { UnauthorizedError } from "../shared/errors/errors.js";


export type AuthEnv = {
  Variables: {
    session: typeof auth.$Infer.Session | null;
  };
};

export const requireAuth =
  createMiddleware<AuthEnv>(
    async (
      c,
      next
    ) => {
      const session =
        await auth.api.getSession({
          headers:
            c.req.raw.headers,
        });

      if (!session) {
        throw new UnauthorizedError(
          "Authentication required"
        );
      }

      c.set(
        "session",
        session
      );

      await next();
    }
  );
import {
  OpenAPIHono,
} from "@hono/zod-openapi";

import {
  throwOnValidationError,
} from "../shared/validation/zod-validator.js";
import type {
  AppEnv,
} from "../types/app-env.js";

export function createOpenApiHono() {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result) => {
      throwOnValidationError(
        result
      );
    },
  });
}

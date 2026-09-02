import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";
import {
  apiErrorBody,
} from "../shared/http/api-response.js";

export const errorHandler: ErrorHandler = (
  error,
  c
) => {
  /*
   * Erreurs métier contrôlées
   */
  if (error instanceof AppError) {
    return c.json(
      apiErrorBody({
        code: error.code,
        message: error.message,
        details: error.details,
      }),
      error.statusCode
    );
  }

  /*
   * Validation Zod non interceptée
   */
  if (error instanceof ZodError) {
    return c.json(
      apiErrorBody({
        code: "VALIDATION_ERROR",
        message:
          "Invalid request data",
        details:
          error.issues.map(
            (issue) => ({
              path:
                issue.path.join(
                  "."
                ),

              message:
                issue.message,
            })
          ),
      }),
      400
    );
  }

  /*
   * Compatibilité temporaire.
   *
   * On garde cela tant que certains endroits
   * utilisent encore HTTPException.
   */
  if (error instanceof HTTPException) {
    return c.json(
      apiErrorBody({
        code:
          getHttpErrorCode(
            error.status
          ),
        message:
          error.message ||
          "Request failed",
      }),
      error.status
    );
  }

  /*
   * Erreur inattendue.
   *
   * Ne jamais retourner error.message au client
   * car il pourrait contenir des infos Prisma,
   * SQL, chemins internes, etc.
   */
   c.set(
      "handledError",
      {
        code:
          "INTERNAL_SERVER_ERROR",

        error:
          error instanceof
          Error
            ? error
            : new Error(
                "Unknown error"
              ),
      }
    );

  return c.json(
    apiErrorBody({
      code:
        "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred",
    }),
    500
  );
};

function getHttpErrorCode(
  status: number
) {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";

    case 401:
      return "UNAUTHORIZED";

    case 403:
      return "FORBIDDEN";

    case 404:
      return "NOT_FOUND";

    case 409:
      return "CONFLICT";

    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

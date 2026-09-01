import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";

export const errorHandler: ErrorHandler = (
  error,
  c
) => {
  /*
   * Erreurs métier contrôlées
   */
  if (error instanceof AppError) {
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,

          ...(error.details !== undefined
            ? {
                details:
                  error.details,
              }
            : {}),
        },
      },
      error.statusCode
    );
  }

  /*
   * Validation Zod non interceptée
   */
  if (error instanceof ZodError) {
    return c.json(
      {
        error: {
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
        },
      },
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
      {
        error: {
          code:
            getHttpErrorCode(
              error.status
            ),

          message:
            error.message ||
            "Request failed",
        },
      },
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
  console.error(
    "Unhandled API error:",
    error
  );

  return c.json(
    {
      error: {
        code:
          "INTERNAL_SERVER_ERROR",

        message:
          "An unexpected error occurred",
      },
    },
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
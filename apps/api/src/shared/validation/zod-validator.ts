import { ValidationError } from "../errors/index.js";

interface ValidationIssue {
  path: Array<PropertyKey>;
  message: string;
}

type ValidationResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: {
        issues: ValidationIssue[];
      };
    };

export function throwOnValidationError(
  result: ValidationResult
) {
  if (result.success) {
    return;
  }

  throw new ValidationError(
    "Invalid request data",
    "VALIDATION_ERROR",
    result.error.issues.map(
      (issue) => ({
        path:
          issue.path.join("."),

        message:
          issue.message,
      })
    )
  );
}

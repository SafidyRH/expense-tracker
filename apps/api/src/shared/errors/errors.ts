import { AppError } from "./app-error.js";
import type { AppErrorCode } from "./error-codes.js";

export class ValidationError extends AppError {
  constructor(
    message: string,
    code: AppErrorCode = "VALIDATION_ERROR",
    details?: unknown
  ) {
    super({
      code,
      message,
      statusCode: 400,
      details,
    });

    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Unauthorized",
    code: AppErrorCode = "UNAUTHORIZED"
  ) {
    super({
      code,
      message,
      statusCode: 401,
    });

    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "Forbidden",
    code: AppErrorCode = "FORBIDDEN"
  ) {
    super({
      code,
      message,
      statusCode: 403,
    });

    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    code: AppErrorCode = "NOT_FOUND"
  ) {
    super({
      code,
      message,
      statusCode: 404,
    });

    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string,
    code: AppErrorCode = "CONFLICT"
  ) {
    super({
      code,
      message,
      statusCode: 409,
    });

    this.name = "ConflictError";
  }
}
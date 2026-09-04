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

export class BadRequestError extends AppError {
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

    this.name = "BadRequestError";
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

export class InternalServerError extends AppError {
  constructor(
    message = "An unexpected error occurred",
    code: AppErrorCode = "INTERNAL_SERVER_ERROR"
  ) {
    super({
      code,
      message,
      statusCode: 500,
    });

    this.name = "InternalServerError";
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(
    message = "Request body is too large"
  ) {
    super({
      code: "PAYLOAD_TOO_LARGE",
      message,
      statusCode: 413,
    });

    this.name =
      "PayloadTooLargeError";
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message = "Too many requests"
  ) {
    super({
      code: "RATE_LIMITED",
      message,
      statusCode: 429,
    });

    this.name =
      "TooManyRequestsError";
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(
    message =
      "Content-Type must be application/json"
  ) {
    super({
      code: "UNSUPPORTED_MEDIA_TYPE",
      message,
      statusCode: 415,
    });

    this.name =
      "UnsupportedMediaTypeError";
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(
    message =
      "HTTP method is not allowed"
  ) {
    super({
      code: "METHOD_NOT_ALLOWED",
      message,
      statusCode: 405,
    });

    this.name =
      "MethodNotAllowedError";
  }
}
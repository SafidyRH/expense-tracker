import type { AppErrorCode } from "./error-codes.js";

export type AppErrorStatus =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500;

interface AppErrorOptions {
  code: AppErrorCode;
  message: string;
  statusCode: AppErrorStatus;

  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;

  readonly statusCode: AppErrorStatus;

  readonly details?: unknown;

  constructor({
    code,
    message,
    statusCode,
    details,
    cause,
  }: AppErrorOptions) {
    super(message, {
      cause,
    });

    this.name = "AppError";

    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
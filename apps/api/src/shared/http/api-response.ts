import type {
  AppErrorCode,
} from "../errors/index.js";

export interface ApiErrorBody {
  error: {
    code: AppErrorCode;
    message: string;
    details?: unknown;
  };
}

export function apiErrorBody({
  code,
  message,
  details,
}: {
  code: AppErrorCode;
  message: string;
  details?: unknown;
}): ApiErrorBody {
  return {
    error: {
      code,
      message,

      ...(details !== undefined
        ? {
            details,
          }
        : {}),
    },
  };
}

import type {
  Logger,
} from "pino";

import type {
  auth,
} from "../lib/auth.js";

import type {
  AppErrorCode,
} from "../shared/errors/error-codes.js";

export interface HandledErrorContext {
  code: AppErrorCode;

  /**
   * Présent uniquement pour
   * les erreurs internes que
   * nous voulons logger avec
   * stack trace.
   */
  error?: Error;
}

export type AppEnv = {
  Variables: {
    session:
      | typeof auth.$Infer.Session
      | null;

    requestId: string;

    requestStartedAt: number;

    logger: Logger;

    handledError:
      | HandledErrorContext
      | null;
  };
};
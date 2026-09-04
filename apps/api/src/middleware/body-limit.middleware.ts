import {
  bodyLimit,
} from "hono/body-limit";

import {
  PayloadTooLargeError,
} from "../shared/errors/errors.js";

export const MAX_API_BODY_SIZE =
  64 * 1024; // 64 KiB

export const apiBodyLimit =
  bodyLimit({
    maxSize:
      MAX_API_BODY_SIZE,

    onError: () => {
      throw new PayloadTooLargeError();
    },
  });
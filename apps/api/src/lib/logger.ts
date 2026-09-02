import pino from "pino";

const environment =
  process.env.NODE_ENV ??
  "development";

const isDevelopment =
  environment === "development";

const isTest =
  environment === "test";

const level = isTest
  ? "silent"
  : process.env.LOG_LEVEL ??
    (isDevelopment
      ? "debug"
      : "info");

export const logger = pino({
  level,

  base: {
    service:
      "expense-tracker-api",

    environment,
  },

  timestamp:
    pino.stdTimeFunctions
      .isoTime,

  redact: {
    paths: [
      "password",
      "*.password",

      "authorization",
      "*.authorization",

      "cookie",
      "*.cookie",

      "token",
      "*.token",

      "accessToken",
      "*.accessToken",

      "refreshToken",
      "*.refreshToken",

      "idToken",
      "*.idToken",

      "secret",
      "*.secret",
    ],

    censor:
      "[REDACTED]",
  },

  ...(isDevelopment
    ? {
        transport: {
          target:
            "pino-pretty",

          options: {
            colorize: true,

            translateTime:
              "SYS:standard",

            singleLine:
              true,

            ignore:
              "pid,hostname",
          },
        },
      }
    : {}),
});
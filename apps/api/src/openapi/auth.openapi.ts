import {
  createRoute,
  z,
} from "@hono/zod-openapi";

import {
  ErrorSchema,
} from "./common.schemas.js";
import {
  unauthorizedResponse,
  validationErrorResponse,
} from "./responses.js";

const AuthUserSchema =
  z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      emailVerified: z.boolean(),
      image: z.string().nullable().optional(),
      defaultCurrency:
        z.string().length(3).nullable().optional(),
      timezone:
        z.string().nullable().optional(),
      createdAt:
        z.string().datetime().optional(),
      updatedAt:
        z.string().datetime().optional(),
    })
    .openapi(
      "AuthUser"
    );

const AuthSessionSchema =
  z
    .object({
      id: z.string().uuid(),
      token: z.string(),
      userId: z.string().uuid(),
      expiresAt:
        z.string().datetime(),
      createdAt:
        z.string().datetime().optional(),
      updatedAt:
        z.string().datetime().optional(),
    })
    .openapi(
      "AuthSession"
    );

const AuthSessionResponseSchema =
  z
    .object({
      user:
        AuthUserSchema,
      session:
        AuthSessionSchema,
    })
    .openapi(
      "AuthSessionResponse"
    );

const SignInEmailRequestSchema =
  z
    .object({
      email:
        z.string().email(),
      password:
        z.string().min(1),
    })
    .openapi(
      "SignInEmailRequest"
    );

const SignUpEmailRequestSchema =
  SignInEmailRequestSchema
    .extend({
      name:
        z.string().min(1),
      defaultCurrency:
        z.string().length(3).optional(),
      timezone:
        z.string().optional(),
    })
    .openapi(
      "SignUpEmailRequest"
    );

const SignOutResponseSchema =
  z
    .object({
      success:
        z.boolean(),
    })
    .openapi(
      "SignOutResponse"
    );

export const signInEmailRoute =
  createRoute({
    method: "post",
    path: "/api/auth/sign-in/email",
    tags: [
      "Auth",
    ],
    summary:
      "Sign in with email and password",
    "x-public": true,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              SignInEmailRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Authenticated session",
        content: {
          "application/json": {
            schema:
              AuthSessionResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
    },
  });

export const signUpEmailRoute =
  createRoute({
    method: "post",
    path: "/api/auth/sign-up/email",
    tags: [
      "Auth",
    ],
    summary:
      "Sign up with email and password",
    "x-public": true,
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema:
              SignUpEmailRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Authenticated session",
        content: {
          "application/json": {
            schema:
              AuthSessionResponseSchema,
          },
        },
      },
      400:
        validationErrorResponse,
    },
  });

export const getSessionRoute =
  createRoute({
    method: "get",
    path: "/api/auth/get-session",
    tags: [
      "Auth",
    ],
    summary:
      "Get the current auth session",
    "x-public": true,
    responses: {
      200: {
        description:
          "Authenticated session or null session payload",
        content: {
          "application/json": {
            schema:
              z.union([
                AuthSessionResponseSchema,
                z.null(),
              ]),
          },
        },
      },
    },
  });

export const signOutRoute =
  createRoute({
    method: "post",
    path: "/api/auth/sign-out",
    tags: [
      "Auth",
    ],
    summary:
      "Sign out the current session",
    security: [
      {
        sessionCookie: [],
      },
    ],
    responses: {
      200: {
        description:
          "Signed out",
        content: {
          "application/json": {
            schema:
              SignOutResponseSchema,
          },
        },
      },
      401:
        unauthorizedResponse,
      500: {
        description:
          "Auth provider error",
        content: {
          "application/json": {
            schema:
              ErrorSchema,
          },
        },
      },
    },
  });

export const betterAuthOpenApiRoutes = [
  signInEmailRoute,
  signUpEmailRoute,
  getSessionRoute,
  signOutRoute,
];

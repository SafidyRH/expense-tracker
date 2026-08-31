import {
  expect,
} from "vitest";

import app from "../../app";

interface RegisterOptions {
  name?: string;
  email?: string;
  password?: string;
}

export async function registerTestUser(
  options: RegisterOptions = {}
) {
  const name =
    options.name ??
    "Test User";

  const email =
    options.email ??
    `test-${crypto.randomUUID()}@example.com`;

  const password =
    options.password ??
    "Password123!";

  const response =
    await app.request(
      "http://localhost:3030/api/auth/sign-up/email",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

  expect(
    response.status
  ).toBeLessThan(300);

  const setCookie =
    response.headers.get(
      "set-cookie"
    );

  if (!setCookie) {
    throw new Error(
      "Authentication did not return a session cookie"
    );
  }

  const cookie =
    setCookie
      .split(";")[0];

  const body =
    (await response.json()) as {
      user: {
        id: string;
        email: string;
      };
    };

  return {
    cookie,
    user: body.user,
    email,
    password,
  };
}
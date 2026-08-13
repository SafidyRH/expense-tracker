import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@expense-tracker/database";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3030",

  trustedOrigins: [
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  ],

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      defaultCurrency: {
        type: "string",
        required: false,
        defaultValue: "MGA",
      },

      timezone: {
        type: "string",
        required: false,
        defaultValue: "Indian/Antananarivo",
      },
    },
  },

  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
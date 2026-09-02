import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";

import type {
  AuthEnv,
} from "../../../middleware/auth.middleware.js";

import {
  requireAuth,
} from "../../../middleware/auth.middleware.js";

import {
  NotFoundError,
} from "../../../shared/errors/index.js";

import {
  throwOnValidationError,
} from "../../../shared/validation/zod-validator.js";

import {
  PrismaFinancialAccountRepository,
} from "../infrastructure/prisma-financial-account.repository.js";

import {
  CreateFinancialAccount,
} from "../application/create-financial-account.js";

import {
  ListFinancialAccounts,
} from "../application/list-financial-accounts.js";

import {
  GetFinancialAccount,
} from "../application/get-financial-account.js";

import {
  UpdateFinancialAccount,
} from "../application/update-financial-account.js";

import {
  ArchiveFinancialAccount,
} from "../application/archive-financial-account.js";

import {
  accountIdSchema,
  createFinancialAccountSchema,
  updateFinancialAccountSchema,
} from "./account.schemas.js";

import {
  toFinancialAccountDto,
} from "./account.mapper.js";

const repository =
  new PrismaFinancialAccountRepository();

const createFinancialAccount =
  new CreateFinancialAccount(repository);

const listFinancialAccounts =
  new ListFinancialAccounts(repository);

const getFinancialAccount =
  new GetFinancialAccount(repository);

const updateFinancialAccount =
  new UpdateFinancialAccount(repository);

const archiveFinancialAccount =
  new ArchiveFinancialAccount(repository);

export const accountRoutes =
  new Hono<AuthEnv>();

accountRoutes.use(
  "*",
  requireAuth
);

accountRoutes.post(
  "/",

  zValidator(
    "json",
    createFinancialAccountSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const input =
      c.req.valid("json");

    const account =
      await createFinancialAccount.execute({
        userId: session!.user.id,

        name: input.name,

        type: input.type,

        institutionName:
          input.institutionName,

        currencyCode:
          input.currencyCode,

        initialBalanceMinor:
          BigInt(
            input.initialBalanceMinor
          ),
      });

    return c.json(
      {
        data:
          toFinancialAccountDto(
            account
          ),
      },
      201
    );
  }
);

accountRoutes.get(
  "/",

  async (c) => {
    const session =
      c.get("session");

    const accounts =
      await listFinancialAccounts.execute(
        session!.user.id
      );

    return c.json({
      data: accounts.map(
        toFinancialAccountDto
      ),
    });
  }
);

accountRoutes.get(
  "/:id",

  zValidator(
    "param",
    accountIdSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const { id } =
      c.req.valid("param");

    const account =
      await getFinancialAccount.execute(
        id,
        session!.user.id
      );

    if (!account) {
      throw new NotFoundError(
        "Financial account not found",
        "ACCOUNT_NOT_FOUND"
      );
    }

    return c.json({
      data:
        toFinancialAccountDto(
          account
        ),
    });
  }
);

accountRoutes.patch(
  "/:id",

  zValidator(
    "param",
    accountIdSchema,
    throwOnValidationError
  ),

  zValidator(
    "json",
    updateFinancialAccountSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const { id } =
      c.req.valid("param");

    const input =
      c.req.valid("json");

    const account =
      await updateFinancialAccount.execute(
        id,
        session!.user.id,
        input
      );

    if (!account) {
      throw new NotFoundError(
        "Financial account not found",
        "ACCOUNT_NOT_FOUND"
      );
    }

    return c.json({
      data:
        toFinancialAccountDto(
          account
        ),
    });
  }
);

accountRoutes.delete(
  "/:id",

  zValidator(
    "param",
    accountIdSchema,
    throwOnValidationError
  ),

  async (c) => {
    const session =
      c.get("session");

    const { id } =
      c.req.valid("param");

    const archived =
      await archiveFinancialAccount.execute(
        id,
        session!.user.id
      );

    if (!archived) {
      throw new NotFoundError(
        "Financial account not found",
        "ACCOUNT_NOT_FOUND"
      );
    }

    return c.body(null, 204);
  }
);


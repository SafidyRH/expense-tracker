import { prisma } from "@expense-tracker/database";

import type {
  CreateFinancialAccountInput,
  FinancialAccount,
  UpdateFinancialAccountInput,
} from "../domain/financial-account.js";

import type { FinancialAccountRepository } from "../domain/financial-account.repository.js";

export class PrismaFinancialAccountRepository
  implements FinancialAccountRepository
{
  async create(
    input: CreateFinancialAccountInput
  ): Promise<FinancialAccount> {
    return prisma.financialAccount.create({
      data: {
        userId: input.userId,

        name: input.name,

        type: input.type,

        institutionName:
          input.institutionName ?? null,

        currencyCode: input.currencyCode,

        initialBalanceMinor:
          input.initialBalanceMinor,

        cachedBalanceMinor:
          input.initialBalanceMinor,
      },
    });
  }

  async findAllByUserId(
    userId: string
  ): Promise<FinancialAccount[]> {
    return prisma.financialAccount.findMany({
      where: {
        userId,
        isArchived: false,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<FinancialAccount | null> {
    return prisma.financialAccount.findFirst({
      where: {
        id,
        userId,
        isArchived: false,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    input: UpdateFinancialAccountInput
  ): Promise<FinancialAccount | null> {
    const result =
      await prisma.financialAccount.updateMany({
        where: {
          id,
          userId,
          isArchived: false,
        },

        data: {
          ...(input.name !== undefined && {
            name: input.name,
          }),

          ...(input.type !== undefined && {
            type: input.type,
          }),

          ...(input.institutionName !== undefined && {
            institutionName:
              input.institutionName,
          }),
        },
      });

    if (result.count === 0) {
      return null;
    }

    return prisma.financialAccount.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async archive(
    id: string,
    userId: string
  ): Promise<boolean> {
    const result =
      await prisma.financialAccount.updateMany({
        where: {
          id,
          userId,
          isArchived: false,
        },

        data: {
          isArchived: true,
        },
      });

    return result.count > 0;
  }
}
import { prisma } from "@expense-tracker/database";
import { Prisma } from "@expense-tracker/database";

import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "../domain/expense.js";

import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";

export class PrismaTransactionRepository
  implements TransactionRepository
{
  async createExpense(
    input: CreateExpenseInput
  ): Promise<CreateExpenseResult> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // -----------------------------------------
      // 1. Idempotence / synchronisation offline
      // -----------------------------------------

      const existing =
        await tx.transaction.findUnique({
          where: {
            userId_clientGeneratedId: {
              userId: input.userId,
              clientGeneratedId:
                input.clientGeneratedId,
            },
          },

          include: {
            entries: true,
            allocations: true,
          },
        });

      if (existing) {
        const entry = existing.entries[0];

        const allocation =
          existing.allocations[0];

        if (!entry || !allocation) {
          throw new Error(
            "Existing transaction is incomplete"
          );
        }

        const account =
          await tx.financialAccount.findUnique({
            where: {
              id: entry.accountId,
            },
          });

        if (!account) {
          throw new Error(
            "Account associated with transaction not found"
          );
        }

        return {
          success: true,
          duplicated: true,

          expense: {
            id: existing.id,

            accountId: entry.accountId,

            categoryId:
              allocation.categoryId,

            amountMinor:
              allocation.amountMinor,

            currencyCode:
              entry.currencyCode,

            description:
              existing.description,

            note:
              existing.note,

            occurredAt:
              existing.occurredAt,

            clientGeneratedId:
              existing.clientGeneratedId,

            balanceAfterMinor:
              account.cachedBalanceMinor,

            createdAt:
              existing.createdAt,
          },
        };
      }

      // -----------------------------------------
      // 2. Vérifier le compte
      // -----------------------------------------

      const account =
        await tx.financialAccount.findFirst({
          where: {
            id: input.accountId,

            userId: input.userId,

            isArchived: false,
          },
        });

      if (!account) {
        return {
          success: false,
          error: "ACCOUNT_NOT_FOUND",
        };
      }

      // -----------------------------------------
      // 3. Vérifier la catégorie
      // -----------------------------------------

      const category =
        await tx.category.findFirst({
          where: {
            id: input.categoryId,

            type: "EXPENSE",

            isArchived: false,

            OR: [
              {
                isSystem: true,
              },
              {
                userId: input.userId,
              },
            ],
          },
        });

      if (!category) {
        return {
          success: false,
          error: "CATEGORY_NOT_FOUND",
        };
      }

      // -----------------------------------------
      // 4. Créer la transaction + ledger
      // -----------------------------------------

      const transaction =
        await tx.transaction.create({
          data: {
            userId: input.userId,

            type: "EXPENSE",

            status: "CONFIRMED",

            description:
              input.description ?? null,

            note:
              input.note ?? null,

            occurredAt:
              input.occurredAt,

            clientGeneratedId:
              input.clientGeneratedId,

            entries: {
              create: {
                accountId:
                  account.id,

                amountMinor:
                  -input.amountMinor,

                currencyCode:
                  account.currencyCode,
              },
            },

            allocations: {
              create: {
                categoryId:
                  category.id,

                amountMinor:
                  input.amountMinor,
              },
            },
          },

          include: {
            entries: true,
            allocations: true,
          },
        });

      // -----------------------------------------
      // 5. Modifier le solde
      // -----------------------------------------

      const updatedAccount =
        await tx.financialAccount.update({
          where: {
            id: account.id,
          },

          data: {
            cachedBalanceMinor: {
              decrement:
                input.amountMinor,
            },
          },
        });

      return {
        success: true,
        duplicated: false,

        expense: {
          id: transaction.id,

          accountId:
            account.id,

          categoryId:
            category.id,

          amountMinor:
            input.amountMinor,

          currencyCode:
            account.currencyCode,

          description:
            transaction.description,

          note:
            transaction.note,

          occurredAt:
            transaction.occurredAt,

          clientGeneratedId:
            transaction.clientGeneratedId,

          balanceAfterMinor:
            updatedAccount.cachedBalanceMinor,

          createdAt:
            transaction.createdAt,
        },
      };
    });
  }
}
import { prisma } from "@expense-tracker/database";
import type { Prisma } from "@expense-tracker/database";

import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "../domain/expense.js";

import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";

import type {
  TransactionHistoryFilters,
  TransactionHistoryResult,
} from "../domain/transaction-history.js";

const transactionHistoryInclude = {
  entries: {
    include: {
      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  allocations: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.TransactionInclude;

type TransactionHistoryRecord =
  Prisma.TransactionGetPayload<{
    include: typeof transactionHistoryInclude;
  }>;

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

  async listHistory(
  filters: TransactionHistoryFilters
): Promise<TransactionHistoryResult> {
  const cursorCondition = filters.cursor
    ? {
        OR: [
          {
            occurredAt: {
              lt: filters.cursor.occurredAt,
            },
          },
          {
            occurredAt: filters.cursor.occurredAt,

            id: {
              lt: filters.cursor.id,
            },
          },
        ],
      }
    : undefined;

  const transactions =
    await prisma.transaction.findMany({
      where: {
        userId: filters.userId,

        // Les suppressions logiques n'apparaissent pas.
        deletedAt: null,

        ...(filters.type && {
          type: filters.type,
        }),

        ...(filters.dateFrom ||
        filters.dateTo
          ? {
              occurredAt: {
                ...(filters.dateFrom && {
                  gte: filters.dateFrom,
                }),

                ...(filters.dateTo && {
                  lte: filters.dateTo,
                }),
              },
            }
          : {}),

        ...(filters.accountId
          ? {
              entries: {
                some: {
                  accountId:
                    filters.accountId,
                },
              },
            }
          : {}),

        ...(filters.categoryId
          ? {
              allocations: {
                some: {
                  categoryId:
                    filters.categoryId,
                },
              },
            }
          : {}),

        ...(cursorCondition
          ? {
              AND: [
                cursorCondition,
              ],
            }
          : {}),
      },

      include: transactionHistoryInclude,

      orderBy: [
        {
          occurredAt: "desc",
        },
        {
          id: "desc",
        },
      ],

      // +1 pour savoir s'il existe une page suivante
      take: filters.limit + 1,
    });

  const hasMore =
    transactions.length >
    filters.limit;

  const page: TransactionHistoryRecord[] =
  hasMore
    ? transactions.slice(
        0,
        filters.limit
      )
    : transactions;

  return {
    hasMore,

    items: page.map(
      (transaction) => ({
        id: transaction.id,

        type: transaction.type,

        status:
          transaction.status,

        description:
          transaction.description,

        note:
          transaction.note,

        occurredAt:
          transaction.occurredAt,

        clientGeneratedId:
          transaction.clientGeneratedId,

        createdAt:
          transaction.createdAt,

        entries:
          transaction.entries.map(
            (entry) => ({
              id: entry.id,

              accountId:
                entry.accountId,

              accountName:
                entry.account.name,

              amountMinor:
                entry.amountMinor,

              currencyCode:
                entry.currencyCode,
            })
          ),

        allocations:
          transaction.allocations.map(
            (allocation) => ({
              id: allocation.id,

              categoryId:
                allocation.categoryId,

              categoryName:
                allocation.category
                  .name,

              amountMinor:
                allocation.amountMinor,
            })
          ),
      })
    ),
  };
}
}
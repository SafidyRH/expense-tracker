import { randomUUID } from "node:crypto";

import { prisma } from "@expense-tracker/database";

import type {
  CategoryType,
} from "../modules/categories/domain/category.js";
import type {
  FinancialAccountType,
} from "../modules/accounts/domain/financial-account.js";

export { prisma };

export function authHeaders(userId: string) {
  return {
    "content-type": "application/json",
    "x-test-user-id": userId,
  };
}

export async function createTestUser() {
  const id = randomUUID();

  return prisma.user.create({
    data: {
      id,
      name: "Integration Test User",
      email: `${id}@test.local`,
      emailVerified: true,
      defaultCurrency: "MGA",
      timezone: "Indian/Antananarivo",
    },
  });
}

export async function cleanupTestUsers(
  userIds: string[]
) {
  if (userIds.length === 0) {
    return;
  }

  await prisma.transactionAllocation.deleteMany({
    where: {
      transaction: {
        userId: {
          in: userIds,
        },
      },
    },
  });

  await prisma.transactionEntry.deleteMany({
    where: {
      transaction: {
        userId: {
          in: userIds,
        },
      },
    },
  });

  await prisma.transaction.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.monthlyCategoryBudget.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.monthlyGlobalBudget.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.category.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.financialAccount.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.account.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

export async function cleanupAllTestUsers() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        endsWith: "@test.local",
      },
    },
    select: {
      id: true,
    },
  });

  await cleanupTestUsers(
    users.map((user) => user.id)
  );
}

export async function createTestAccount({
  userId,
  name = "Cash",
  type = "CASH",
  currencyCode = "MGA",
  initialBalanceMinor = 0n,
  isArchived = false,
}: {
  userId: string;
  name?: string;
  type?: FinancialAccountType;
  currencyCode?: string;
  initialBalanceMinor?: bigint;
  isArchived?: boolean;
}) {
  return prisma.financialAccount.create({
    data: {
      id: randomUUID(),
      userId,
      name,
      type,
      institutionName: null,
      currencyCode,
      initialBalanceMinor,
      cachedBalanceMinor:
        initialBalanceMinor,
      isArchived,
    },
  });
}

export async function createTestCategory({
  userId,
  name = "Groceries",
  type = "EXPENSE",
  icon = "tag",
}: {
  userId: string;
  name?: string;
  type?: CategoryType;
  icon?: string | null;
}) {
  return prisma.category.create({
    data: {
      id: randomUUID(),
      userId,
      name,
      type,
      icon,
      isSystem: false,
      isArchived: false,
    },
  });
}

export async function parseJson<T>(
  response: Response
): Promise<T> {
  return response.json() as Promise<T>;
}

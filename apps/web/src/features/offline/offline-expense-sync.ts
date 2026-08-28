import type {
  QueryClient,
} from "@tanstack/react-query";

import {
  ApiError,
} from "@/lib/api-client";

import {
  createExpense,
} from "@/features/transactions/transaction.api";

import type {
  CreateExpenseInput,
  CreateExpenseResponse,
} from "@/features/transactions/transaction.types";

import {
  canUseOfflineDb,
  emitOfflineQueueChange,
  offlineDb,
  type OfflineExpenseMutation,
} from "./offline-expense-db";

let activeSync:
  | Promise<void>
  | null = null;

export async function enqueueOfflineExpense(
  input: CreateExpenseInput,
  errorMessage: string | null = null
) {
  if (!canUseOfflineDb()) {
    throw new Error(
      "Le stockage hors ligne n'est pas disponible sur cet appareil."
    );
  }

  const clientGeneratedId =
    input.clientGeneratedId ??
    crypto.randomUUID();

  const now =
    new Date().toISOString();

  await offlineDb.expenses.put({
    id: clientGeneratedId,
    clientGeneratedId,
    input: {
      ...input,
      clientGeneratedId,
    },
    status: "pending",
    attempts: 0,
    errorMessage,
    createdAt: now,
    updatedAt: now,
    lastAttemptAt: null,
  });

  emitOfflineQueueChange();

  return {
    data: {
      id: clientGeneratedId,
      type: "EXPENSE",
      accountId: input.accountId,
      categoryId: input.categoryId,
      amountMinor: input.amountMinor,
      currencyCode: "MGA",
      description:
        input.description ?? null,
      note: input.note ?? null,
      occurredAt:
        input.occurredAt ?? now,
      clientGeneratedId,
      balanceAfterMinor: "0",
      createdAt: now,
    },
    meta: {
      duplicated: false,
      queuedOffline: true,
    },
  } satisfies CreateExpenseResponse & {
    meta: {
      duplicated: boolean;
      queuedOffline: boolean;
    };
  };
}

export async function syncOfflineExpenses(
  queryClient?: QueryClient
) {
  if (
    !canUseOfflineDb() ||
    typeof navigator === "undefined" ||
    !navigator.onLine
  ) {
    return;
  }

  if (activeSync) {
    return activeSync;
  }

  activeSync = runSync(queryClient)
    .finally(() => {
      activeSync = null;
      emitOfflineQueueChange();
    });

  return activeSync;
}

export async function retryOfflineExpense(
  id: string,
  queryClient?: QueryClient
) {
  const existing =
    await offlineDb.expenses.get(id);

  if (!existing) {
    return;
  }

  await offlineDb.expenses.update(id, {
    status: "pending",
    errorMessage: null,
    updatedAt:
      new Date().toISOString(),
  });

  emitOfflineQueueChange();

  await syncOfflineExpenses(
    queryClient
  );
}

export async function removeOfflineExpense(
  id: string
) {
  await offlineDb.expenses.delete(id);
  emitOfflineQueueChange();
}

export async function getOfflineExpenses() {
  if (!canUseOfflineDb()) {
    return [];
  }

  return offlineDb.expenses
    .orderBy("createdAt")
    .toArray();
}

export async function getOfflineExpenseCounts() {
  const items =
    await getOfflineExpenses();

  return {
    pending: items.filter(
      (item) =>
        item.status === "pending"
    ).length,
    syncing: items.filter(
      (item) =>
        item.status === "syncing"
    ).length,
    conflict: items.filter(
      (item) =>
        item.status === "conflict"
    ).length,
    total: items.length,
  };
}

export function isNetworkFailure(
  error: unknown
) {
  return (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) ||
    error instanceof TypeError;
}

async function runSync(
  queryClient?: QueryClient
) {
  const items =
    await offlineDb.expenses
      .where("status")
      .anyOf([
        "pending",
        "syncing",
      ])
      .sortBy("createdAt");

  for (const item of items) {
    await syncOne(item);
  }

  await invalidateFinanceData(
    queryClient
  );
}

async function syncOne(
  item: OfflineExpenseMutation
) {
  const now =
    new Date().toISOString();

  await offlineDb.expenses.update(
    item.id,
    {
      status: "syncing",
      attempts: item.attempts + 1,
      lastAttemptAt: now,
      updatedAt: now,
    }
  );

  emitOfflineQueueChange();

  try {
    await createExpense(
      item.input
    );

    await offlineDb.expenses.delete(
      item.id
    );
  } catch (error) {
    if (isNetworkFailure(error)) {
      await offlineDb.expenses.update(
        item.id,
        {
          status: "pending",
          errorMessage:
            "Connexion indisponible. Nouvelle tentative automatique au retour du réseau.",
          updatedAt:
            new Date().toISOString(),
        }
      );

      return;
    }

    await offlineDb.expenses.update(
      item.id,
      {
        status: "conflict",
        errorMessage:
          getConflictMessage(error),
        updatedAt:
          new Date().toISOString(),
      }
    );
  } finally {
    emitOfflineQueueChange();
  }
}

async function invalidateFinanceData(
  queryClient?: QueryClient
) {
  if (!queryClient) {
    return;
  }

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [
        "transactions",
      ],
    }),
    queryClient.invalidateQueries({
      queryKey: [
        "accounts",
      ],
    }),
    queryClient.invalidateQueries({
      queryKey: [
        "budgets",
      ],
    }),
  ]);
}

function getConflictMessage(
  error: unknown
) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Session expirée. Reconnectez-vous puis réessayez la synchronisation.";
    }

    if (error.status >= 400 && error.status < 500) {
      return error.message;
    }
  }

  return "Cette dépense n'a pas pu être synchronisée. Vérifiez le compte, la catégorie ou le montant.";
}

import Dexie, {
  type Table,
} from "dexie";

import type {
  FinancialAccount,
} from "@/features/accounts/account.types";

import type {
  Category,
} from "@/features/categories/category.types";

import type {
  CreateExpenseInput,
} from "@/features/transactions/transaction.types";

export type OfflineExpenseStatus =
  | "pending"
  | "syncing"
  | "conflict";

export interface OfflineExpenseMutation {
  id: string;
  clientGeneratedId: string;
  input: CreateExpenseInput;
  status: OfflineExpenseStatus;
  attempts: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt: string | null;
}

export interface OfflineCategorySnapshot
  extends Category {
  cachedAt: string;
}

export interface OfflineAccountSnapshot
  extends FinancialAccount {
  cachedAt: string;
}

class ExpenseTrackerOfflineDatabase extends Dexie {
  expenses!: Table<
    OfflineExpenseMutation,
    string
  >;

  accounts!: Table<
    OfflineAccountSnapshot,
    string
  >;

  categories!: Table<
    OfflineCategorySnapshot,
    string
  >;

  constructor() {
    super(
      "expense-tracker-offline"
    );

    this.version(1).stores({
      expenses:
        "id, clientGeneratedId, status, createdAt, updatedAt",
    });

    this.version(2).stores({
      expenses:
        "id, clientGeneratedId, status, createdAt, updatedAt",
      accounts:
        "id, isArchived, updatedAt, cachedAt",
      categories:
        "id, type, sortOrder, cachedAt",
    });
  }
}

export const offlineDb =
  new ExpenseTrackerOfflineDatabase();

export function canUseOfflineDb() {
  return (
    typeof window !== "undefined" &&
    "indexedDB" in window
  );
}

export function emitOfflineQueueChange() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "offline-expense-queue-change"
    )
  );
}

export async function cacheOfflineAccounts(
  accounts: FinancialAccount[]
) {
  if (!canUseOfflineDb()) {
    return;
  }

  const cachedAt =
    new Date().toISOString();

  await offlineDb.accounts.bulkPut(
    accounts.map((account) => ({
      ...account,
      cachedAt,
    }))
  );
}

export async function getCachedOfflineAccounts() {
  if (!canUseOfflineDb()) {
    return [];
  }

  const accounts =
    await offlineDb.accounts.toArray();

  return accounts.filter(
    (account) =>
      !account.isArchived
  );
}

export async function cacheOfflineCategories(
  categories: Category[]
) {
  if (!canUseOfflineDb()) {
    return;
  }

  const cachedAt =
    new Date().toISOString();

  await offlineDb.categories.bulkPut(
    categories.map((category) => ({
      ...category,
      cachedAt,
    }))
  );
}

export async function getCachedOfflineCategories(
  type: Category["type"]
) {
  if (!canUseOfflineDb()) {
    return [];
  }

  return offlineDb.categories
    .where("type")
    .equals(type)
    .sortBy("sortOrder");
}

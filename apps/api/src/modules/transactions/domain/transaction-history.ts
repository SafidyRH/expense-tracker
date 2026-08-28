export const transactionTypes = [
  "EXPENSE",
  "INCOME",
  "TRANSFER",
  "ADJUSTMENT",
] as const;

export type TransactionType =
  (typeof transactionTypes)[number];

export type TransactionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

export interface TransactionCursor {
  occurredAt: Date;
  id: string;
}

export interface TransactionHistoryFilters {
  userId: string;

  type?: TransactionType;

  accountId?: string;
  categoryId?: string;

  dateFrom?: Date;
  dateTo?: Date;

  limit: number;

  cursor?: TransactionCursor;
}

export interface TransactionHistoryEntry {
  id: string;

  accountId: string;
  accountName: string;

  amountMinor: bigint;

  currencyCode: string;
}

export interface TransactionHistoryAllocation {
  id: string;

  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categorySystemKey: string | null;

  amountMinor: bigint;
}

export interface TransactionHistoryItem {
  id: string;

  type: TransactionType;
  status: TransactionStatus;

  description: string | null;
  note: string | null;

  occurredAt: Date;

  clientGeneratedId: string;

  createdAt: Date;

  entries: TransactionHistoryEntry[];

  allocations: TransactionHistoryAllocation[];
}

export interface TransactionHistoryResult {
  items: TransactionHistoryItem[];

  hasMore: boolean;
}

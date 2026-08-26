export interface TransactionEntry {
  id: string;

  account: {
    id: string;
    name: string;
  };

  amountMinor: string;

  currencyCode: string;
}

export interface TransactionAllocation {
  id: string;

  category: {
    id: string;
    name: string;
  };

  amountMinor: string;
}

export interface Transaction {
  id: string;

  type:
    | "EXPENSE"
    | "INCOME"
    | "TRANSFER"
    | "ADJUSTMENT";

  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED";

  description:
    | string
    | null;

  note:
    | string
    | null;

  occurredAt: string;

  entries:
    TransactionEntry[];

  allocations:
    TransactionAllocation[];
}

export interface TransactionsResponse {
  data: Transaction[];

  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor:
      | string
      | null;
  };
}
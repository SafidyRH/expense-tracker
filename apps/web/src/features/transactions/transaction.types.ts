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

export interface CreateExpenseInput {
  accountId: string;
  categoryId: string;

  amountMinor: string;

  description?: string;
  note?: string;

  occurredAt?: string;

  clientGeneratedId?: string;
}

export interface CreateIncomeInput {
  accountId: string;
  categoryId: string;

  amountMinor: string;

  description?: string;
  note?: string;

  occurredAt?: string;

  clientGeneratedId?: string;
}

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;

  amountMinor: string;

  description?: string;
  note?: string;

  occurredAt?: string;

  clientGeneratedId?: string;
}

export interface CreateExpenseResponse {
  data: {
    id: string;

    type: "EXPENSE";

    accountId: string;
    categoryId: string;

    amountMinor: string;

    currencyCode: string;

    description: string | null;
    note: string | null;

    occurredAt: string;

    clientGeneratedId: string;

    balanceAfterMinor: string;

    createdAt: string;
  };

  meta: {
    duplicated: boolean;
  };
}

export interface CreateIncomeResponse {
  data: {
    id: string;

    type: "INCOME";

    accountId: string;
    categoryId: string;

    amountMinor: string;

    currencyCode: string;

    description: string | null;
    note: string | null;

    occurredAt: string;

    clientGeneratedId: string;

    balanceAfterMinor: string;

    createdAt: string;
  };

  meta: {
    duplicated: boolean;
  };
}

export interface CreateTransferResponse {
  data: {
    id: string;

    type: "TRANSFER";

    fromAccountId: string;
    toAccountId: string;

    amountMinor: string;

    currencyCode: string;

    description: string | null;
    note: string | null;

    occurredAt: string;

    clientGeneratedId: string;

    fromBalanceAfterMinor: string;
    toBalanceAfterMinor: string;

    createdAt: string;
  };

  meta: {
    duplicated: boolean;
  };
}

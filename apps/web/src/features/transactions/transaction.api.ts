import { apiFetch } from "@/lib/api-client";

import type {
  CreateExpenseInput,
  CreateExpenseResponse,
  TransactionsResponse,
} from "./transaction.types";

export interface TransactionQuery {
  type?:
    | "EXPENSE"
    | "INCOME"
    | "TRANSFER"
    | "ADJUSTMENT";

  accountId?: string;
  categoryId?: string;

  dateFrom?: string;
  dateTo?: string;

  limit?: number;
  cursor?: string;
}

export function getTransactions(
  query: TransactionQuery = {}
) {
  const params =
    new URLSearchParams();

  if (query.type) {
    params.set("type", query.type);
  }

  if (query.accountId) {
    params.set(
      "accountId",
      query.accountId
    );
  }

  if (query.categoryId) {
    params.set(
      "categoryId",
      query.categoryId
    );
  }

  if (query.dateFrom) {
    params.set(
      "dateFrom",
      query.dateFrom
    );
  }

  if (query.dateTo) {
    params.set(
      "dateTo",
      query.dateTo
    );
  }

  if (query.limit) {
    params.set(
      "limit",
      String(query.limit)
    );
  }

  if (query.cursor) {
    params.set(
      "cursor",
      query.cursor
    );
  }

  const queryString =
    params.toString();

  return apiFetch<TransactionsResponse>(
    `/api/transactions${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export function createExpense(
  input: CreateExpenseInput
) {
  return apiFetch<CreateExpenseResponse>(
    "/api/transactions/expenses",
    {
      method: "POST",

      body: JSON.stringify(input),
    }
  );
}
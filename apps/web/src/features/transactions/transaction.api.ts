import {
  apiFetch,
} from "@/lib/api-client";

import type {
  CreateExpenseInput,
  CreateExpenseResponse,
  TransactionsResponse,
} from "./transaction.types";

export function getTransactions() {
  return apiFetch<TransactionsResponse>(
    "/api/transactions?limit=5"
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
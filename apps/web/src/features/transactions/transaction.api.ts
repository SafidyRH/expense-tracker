import {
  apiFetch,
} from "@/lib/api-client";

import type {
  TransactionsResponse,
} from "./transaction.types";

export function getTransactions() {
  return apiFetch<TransactionsResponse>(
    "/api/transactions?limit=5"
  );
}
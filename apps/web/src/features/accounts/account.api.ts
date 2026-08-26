import {
  apiFetch,
} from "@/lib/api-client";

import type {
  AccountResponse,
  AccountsResponse,
  CreateFinancialAccountInput,
} from "./account.types";

export function getAccounts() {
  return apiFetch<AccountsResponse>(
    "/api/accounts"
  );
}

export function createAccount(
  input: CreateFinancialAccountInput
) {
  return apiFetch<AccountResponse>(
    "/api/accounts",
    {
      method: "POST",

      body: JSON.stringify(input),
    }
  );
}
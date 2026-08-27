import {
  apiFetch,
} from "@/lib/api-client";

import type {
  AccountResponse,
  AccountsResponse,
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput,
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

export function updateAccount({
  id,
  input,
}: {
  id: string;
  input: UpdateFinancialAccountInput;
}) {
  return apiFetch<AccountResponse>(
    `/api/accounts/${id}`,
    {
      method: "PATCH",

      body: JSON.stringify(input),
    }
  );
}

export function archiveAccount(
  id: string
) {
  return apiFetch<void>(
    `/api/accounts/${id}`,
    {
      method: "DELETE",
    }
  );
}

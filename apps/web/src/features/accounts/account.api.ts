import {
  apiFetch,
} from "@/lib/api-client";

import type {
  AccountsResponse,
} from "./account.types";

export function getAccounts() {
  return apiFetch<AccountsResponse>(
    "/api/accounts"
  );
}
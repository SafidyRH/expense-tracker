import {
  apiFetch,
} from "@/lib/api-client";

import type {
  BudgetOverviewResponse,
  UpsertBudgetInput,
} from "./budget.types";

export function getBudgetOverview(
  month: string
) {
  const params =
    new URLSearchParams({
      month,
    });

  return apiFetch<BudgetOverviewResponse>(
    `/api/budgets?${params.toString()}`
  );
}

export function upsertGlobalBudget(
  input: UpsertBudgetInput
) {
  return apiFetch(
    "/api/budgets/global",
    {
      method: "PUT",

      body: JSON.stringify(input),
    }
  );
}

export function upsertCategoryBudget({
  categoryId,
  input,
}: {
  categoryId: string;
  input: UpsertBudgetInput;
}) {
  return apiFetch(
    `/api/budgets/categories/${categoryId}`,
    {
      method: "PUT",

      body: JSON.stringify(input),
    }
  );
}

export function deleteCategoryBudget({
  categoryId,
  month,
}: {
  categoryId: string;
  month: string;
}) {
  const params =
    new URLSearchParams({
      month,
    });

  return apiFetch<void>(
    `/api/budgets/categories/${categoryId}?${params.toString()}`,
    {
      method: "DELETE",
    }
  );
}

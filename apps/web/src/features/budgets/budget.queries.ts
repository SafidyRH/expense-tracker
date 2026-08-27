import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteCategoryBudget,
  getBudgetOverview,
  upsertCategoryBudget,
  upsertGlobalBudget,
} from "./budget.api";

export function useBudgetOverview(
  month: string
) {
  return useQuery({
    queryKey: [
      "budgets",
      month,
    ],

    queryFn: () =>
      getBudgetOverview(month),
  });
}

export function useUpsertGlobalBudget() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      upsertGlobalBudget,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "budgets",
        ],
      });
    },
  });
}

export function useUpsertCategoryBudget() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      upsertCategoryBudget,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "budgets",
        ],
      });
    },
  });
}

export function useDeleteCategoryBudget() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteCategoryBudget,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "budgets",
        ],
      });
    },
  });
}

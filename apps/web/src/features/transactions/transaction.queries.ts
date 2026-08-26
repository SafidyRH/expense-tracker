import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createExpense,
  getTransactions,
} from "./transaction.api";

import type {
  TransactionQuery,
} from "./transaction.api";

export function useTransactions(
  query: TransactionQuery = {}
) {
  return useQuery({
    queryKey: [
      "transactions",
      query,
    ],

    queryFn: () =>
      getTransactions(query),
  });
}

export function useCreateExpense() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createExpense,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "transactions",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "accounts",
          ],
        }),
      ]);
    },
  });
}
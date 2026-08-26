import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createExpense,
  getTransactions,
} from "./transaction.api";

export function useTransactions() {
  return useQuery({
    queryKey: [
      "transactions",
      "latest",
    ],

    queryFn:
      getTransactions,
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
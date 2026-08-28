import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createExpense,
  createIncome,
  createTransfer,
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

export function useInfiniteTransactions(
  query: TransactionQuery = {}
) {
  return useInfiniteQuery({
    queryKey: [
      "transactions",
      "infinite",
      query,
    ],

    initialPageParam:
      undefined as string | undefined,

    queryFn: ({
      pageParam,
    }) =>
      getTransactions({
        ...query,
        cursor: pageParam,
      }),

    getNextPageParam: (
      lastPage
    ) =>
      lastPage.pagination.nextCursor ??
      undefined,
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

export function useCreateIncome() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createIncome,

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

        queryClient.invalidateQueries({
          queryKey: [
            "budgets",
          ],
        }),
      ]);
    },
  });
}

export function useCreateTransfer() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createTransfer,

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

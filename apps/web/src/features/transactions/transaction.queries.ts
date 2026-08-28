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

import {
  enqueueOfflineExpense,
  isNetworkFailure,
  syncOfflineExpenses,
} from "@/features/offline/offline-expense-sync";

import type {
  CreateExpenseInput,
} from "./transaction.types";

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
    mutationFn: async (
      input: CreateExpenseInput
    ) => {
      const inputWithClientId = {
        ...input,
        clientGeneratedId:
          input.clientGeneratedId ??
          crypto.randomUUID(),
      };

      if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        return enqueueOfflineExpense(
          inputWithClientId,
          "Dépense enregistrée hors ligne. Synchronisation automatique au retour du réseau."
        );
      }

      try {
        return await createExpense(
          inputWithClientId
        );
      } catch (error) {
        if (isNetworkFailure(error)) {
          return enqueueOfflineExpense(
            inputWithClientId,
            "Connexion perdue. La dépense sera synchronisée automatiquement."
          );
        }

        throw error;
      }
    },

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

        queryClient.invalidateQueries({
          queryKey: [
            "budgets",
          ],
        }),
      ]);

      await syncOfflineExpenses(
        queryClient
      );
    },
  });
}

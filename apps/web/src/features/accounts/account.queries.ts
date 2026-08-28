import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  archiveAccount,
  createAccount,
  getAccounts,
  updateAccount,
} from "./account.api";

import {
  cacheOfflineAccounts,
} from "@/features/offline/offline-expense-db";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],

    queryFn: async () => {
      const response =
        await getAccounts();

      await cacheOfflineAccounts(
        response.data
      );

      return response;
    },
  });
}

export function useCreateAccount() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createAccount,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

export function useUpdateAccount() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: updateAccount,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

export function useArchiveAccount() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: archiveAccount,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

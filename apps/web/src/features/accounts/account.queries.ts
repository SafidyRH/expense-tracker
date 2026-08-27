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

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],

    queryFn: getAccounts,
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

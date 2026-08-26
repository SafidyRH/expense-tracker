import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAccount,
  getAccounts,
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
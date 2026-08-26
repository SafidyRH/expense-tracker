import {
  useQuery,
} from "@tanstack/react-query";

import {
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
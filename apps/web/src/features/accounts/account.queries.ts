import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAccounts,
} from "./account.api";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],

    queryFn: getAccounts,
  });
}
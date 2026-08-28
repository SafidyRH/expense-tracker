import { useQuery } from "@tanstack/react-query";

import {
  getCategories,
} from "./category.api";

import {
  cacheOfflineCategories,
} from "@/features/offline/offline-expense-db";

import type {
  CategoryType,
} from "./category.types";

export function useCategories(
  type?: CategoryType
) {
  return useQuery({
    queryKey: [
      "categories",
      type ?? "ALL",
    ],

    queryFn: async () => {
      const response =
        await getCategories(type);

      await cacheOfflineCategories(
        response.data
      );

      return response;
    },
  });
}

import { useQuery } from "@tanstack/react-query";

import {
  getCategories,
} from "./category.api";

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

    queryFn: () =>
      getCategories(type),
  });
}
import { apiFetch } from "@/lib/api-client";

import type {
  CategoriesResponse,
  CategoryType,
} from "./category.types";

export function getCategories(
  type?: CategoryType
) {
  const searchParams =
    new URLSearchParams();

  if (type) {
    searchParams.set("type", type);
  }

  const query =
    searchParams.toString();

  return apiFetch<CategoriesResponse>(
    `/api/categories${
      query ? `?${query}` : ""
    }`
  );
}
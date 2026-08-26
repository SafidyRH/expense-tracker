export type CategoryType =
  | "EXPENSE"
  | "INCOME";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;

  icon: string | null;

  systemKey: string | null;

  parentId: string | null;

  isSystem: boolean;

  sortOrder: number;
}

export interface CategoriesResponse {
  data: Category[];
}
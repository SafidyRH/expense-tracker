export const categoryTypes = [
  "EXPENSE",
  "INCOME",
] as const;

export type CategoryType =
  (typeof categoryTypes)[number];

export interface Category {
  id: string;

  userId: string | null;

  name: string;

  type: CategoryType;

  icon: string | null;

  systemKey: string | null;

  parentId: string | null;

  isSystem: boolean;

  isArchived: boolean;

  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  userId: string;

  name: string;

  type: CategoryType;

  icon?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string | null;
}
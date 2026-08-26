import type {
  Category,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.js";

export interface CategoryRepository {
  create(
    input: CreateCategoryInput
  ): Promise<Category>;

  findAvailableForUser(
    userId: string,
    type?: CategoryType
  ): Promise<Category[]>;

  updateCustomCategory(
    id: string,
    userId: string,
    input: UpdateCategoryInput
  ): Promise<Category | null>;

  archiveCustomCategory(
    id: string,
    userId: string
  ): Promise<boolean>;
}
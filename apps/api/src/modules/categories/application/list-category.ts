import type {
  CategoryType,
} from "../domain/category.js";

import type {
  CategoryRepository,
} from "../domain/category.repository.js";

export class ListCategories {
  constructor(
    private readonly repository:
      CategoryRepository
  ) {}

  execute(
    userId: string,
    type?: CategoryType
  ) {
    return this.repository.findAvailableForUser(
      userId,
      type
    );
  }
}
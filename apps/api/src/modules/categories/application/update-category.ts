import type {
  UpdateCategoryInput,
} from "../domain/category.js";

import type {
  CategoryRepository,
} from "../domain/category.repository.js";

export class UpdateCategory {
  constructor(
    private readonly repository:
      CategoryRepository
  ) {}

  execute(
    id: string,
    userId: string,
    input: UpdateCategoryInput
  ) {
    return this.repository.updateCustomCategory(
      id,
      userId,
      input
    );
  }
}
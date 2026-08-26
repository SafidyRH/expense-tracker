import type {
  CreateCategoryInput,
} from "../domain/category.js";

import type {
  CategoryRepository,
} from "../domain/category.repository.js";

export class CreateCategory {
  constructor(
    private readonly repository:
      CategoryRepository
  ) {}

  execute(input: CreateCategoryInput) {
    return this.repository.create(input);
  }
}
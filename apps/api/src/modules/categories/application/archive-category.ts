import type {
  CategoryRepository,
} from "../domain/category.repository.js";

export class ArchiveCategory {
  constructor(
    private readonly repository:
      CategoryRepository
  ) {}

  execute(
    id: string,
    userId: string
  ) {
    return this.repository.archiveCustomCategory(
      id,
      userId
    );
  }
}
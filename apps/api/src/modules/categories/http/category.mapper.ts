import type {
  Category,
} from "../domain/category.js";

export function toCategoryDto(
  category: Category
) {
  return {
    id: category.id,

    name: category.name,

    type: category.type,

    icon: category.icon,

    systemKey: category.systemKey,

    parentId: category.parentId,

    isSystem: category.isSystem,

    sortOrder: category.sortOrder,
  };
}
import type {
  CreatedExpense,
} from "../domain/expense.js";

export function toExpenseDto(
  expense: CreatedExpense
) {
  return {
    id: expense.id,

    type: "EXPENSE",

    accountId:
      expense.accountId,

    categoryId:
      expense.categoryId,

    amountMinor:
      expense.amountMinor.toString(),

    currencyCode:
      expense.currencyCode,

    description:
      expense.description,

    note:
      expense.note,

    occurredAt:
      expense.occurredAt.toISOString(),

    clientGeneratedId:
      expense.clientGeneratedId,

    balanceAfterMinor:
      expense.balanceAfterMinor.toString(),

    createdAt:
      expense.createdAt.toISOString(),
  };
}
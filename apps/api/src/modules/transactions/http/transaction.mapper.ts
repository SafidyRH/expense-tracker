import type {
  CreatedExpense,
} from "../domain/expense.js";
import type {
  TransactionHistoryItem,
} from "../domain/transaction-history.js";

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

export function toTransactionHistoryDto(
  transaction:
    TransactionHistoryItem
) {
  return {
    id: transaction.id,

    type:
      transaction.type,

    status:
      transaction.status,

    description:
      transaction.description,

    note:
      transaction.note,

    occurredAt:
      transaction.occurredAt.toISOString(),

    clientGeneratedId:
      transaction.clientGeneratedId,

    entries:
      transaction.entries.map(
        (entry) => ({
          id: entry.id,

          account: {
            id:
              entry.accountId,

            name:
              entry.accountName,
          },

          amountMinor:
            entry.amountMinor.toString(),

          currencyCode:
            entry.currencyCode,
        })
      ),

    allocations:
      transaction.allocations.map(
        (allocation) => ({
          id:
            allocation.id,

          category: {
            id:
              allocation.categoryId,

            name:
              allocation.categoryName,
          },

          amountMinor:
            allocation.amountMinor.toString(),
        })
      ),

    createdAt:
      transaction.createdAt.toISOString(),
  };
}
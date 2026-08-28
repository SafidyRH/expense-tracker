import type {
  CreatedExpense,
} from "../domain/expense.js";
import type {
  CreatedIncome,
} from "../domain/income.js";
import type {
  CreatedTransfer,
} from "../domain/transfer.js";
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

            icon:
              allocation.categoryIcon,

            systemKey:
              allocation.categorySystemKey,
          },

          amountMinor:
            allocation.amountMinor.toString(),
        })
      ),

    createdAt:
      transaction.createdAt.toISOString(),
  };
}

export function toIncomeDto(
  income: CreatedIncome
) {
  return {
    id: income.id,

    type: "INCOME",

    accountId:
      income.accountId,

    categoryId:
      income.categoryId,

    amountMinor:
      income.amountMinor.toString(),

    currencyCode:
      income.currencyCode,

    description:
      income.description,

    note:
      income.note,

    occurredAt:
      income.occurredAt.toISOString(),

    clientGeneratedId:
      income.clientGeneratedId,

    balanceAfterMinor:
      income.balanceAfterMinor.toString(),

    createdAt:
      income.createdAt.toISOString(),
  };
}

export function toTransferDto(
  transfer: CreatedTransfer
) {
  return {
    id: transfer.id,

    type: "TRANSFER",

    fromAccountId:
      transfer.fromAccountId,

    toAccountId:
      transfer.toAccountId,

    amountMinor:
      transfer.amountMinor.toString(),

    currencyCode:
      transfer.currencyCode,

    description:
      transfer.description,

    note:
      transfer.note,

    occurredAt:
      transfer.occurredAt.toISOString(),

    clientGeneratedId:
      transfer.clientGeneratedId,

    fromBalanceAfterMinor:
      transfer.fromBalanceAfterMinor.toString(),

    toBalanceAfterMinor:
      transfer.toBalanceAfterMinor.toString(),

    createdAt:
      transfer.createdAt.toISOString(),
  };
}

import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "./expense.js";

import type {
  TransactionHistoryFilters,
  TransactionHistoryResult,
} from "./transaction-history.js";

export interface TransactionRepository {
  createExpense(
    input: CreateExpenseInput
  ): Promise<CreateExpenseResult>;

  listHistory(
    filters: TransactionHistoryFilters
  ): Promise<TransactionHistoryResult>;
}
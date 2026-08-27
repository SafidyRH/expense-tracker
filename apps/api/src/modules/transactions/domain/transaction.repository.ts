import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "./expense.js";
import type {
  CreateIncomeInput,
  CreateIncomeResult,
} from "./income.js";
import type {
  CreateTransferInput,
  CreateTransferResult,
} from "./transfer.js";

import type {
  TransactionHistoryFilters,
  TransactionHistoryResult,
} from "./transaction-history.js";

export interface TransactionRepository {
  createExpense(
    input: CreateExpenseInput
  ): Promise<CreateExpenseResult>;

  createIncome(
    input: CreateIncomeInput
  ): Promise<CreateIncomeResult>;

  createTransfer(
    input: CreateTransferInput
  ): Promise<CreateTransferResult>;

  listHistory(
    filters: TransactionHistoryFilters
  ): Promise<TransactionHistoryResult>;
}

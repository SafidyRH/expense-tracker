import type {
  CreateExpenseInput,
  CreateExpenseResult,
} from "./expense.js";

export interface TransactionRepository {
  createExpense(
    input: CreateExpenseInput
  ): Promise<CreateExpenseResult>;
}
import type {
  CreateExpenseInput,
} from "../domain/expense.js";

import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";

export class CreateExpense {
  constructor(
    private readonly repository: TransactionRepository
  ) {}

  execute(input: CreateExpenseInput) {
    if (input.amountMinor <= 0n) {
      throw new Error(
        "Expense amount must be greater than zero"
      );
    }

    return this.repository.createExpense(input);
  }
}
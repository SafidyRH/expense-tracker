import { ValidationError } from "../../../shared/errors/errors.js";
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
    if (
  input.amountMinor <= 0n
) {
  throw new ValidationError(
    "Expense amount must be greater than zero",
    "INVALID_TRANSACTION_AMOUNT"
  );
}

    return this.repository.createExpense(input);
  }
}
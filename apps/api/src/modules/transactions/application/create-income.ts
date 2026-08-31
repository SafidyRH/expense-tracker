import type {
  CreateIncomeInput,
} from "../domain/income.js";

import type {
  TransactionRepository,
} from "../domain/transaction.repository.js";

export class CreateIncome {
  constructor(
    private readonly repository: TransactionRepository
  ) {}

  execute(
    input: CreateIncomeInput
  ) {
    if (input.amountMinor <= 0n) {
      throw new Error(
        "Income amount must be greater than zero"
      );
    }

    return this.repository.createIncome(
      input
    );
  }
}

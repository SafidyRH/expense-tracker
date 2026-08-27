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
    return this.repository.createIncome(
      input
    );
  }
}

import type {
  UpdateFinancialAccountInput,
} from "../domain/financial-account.js";

import type { FinancialAccountRepository } from "../domain/financial-account.repository.js";

export class UpdateFinancialAccount {
  constructor(
    private readonly repository: FinancialAccountRepository
  ) {}

  execute(
    id: string,
    userId: string,
    input: UpdateFinancialAccountInput
  ) {
    return this.repository.update(
      id,
      userId,
      input
    );
  }
}